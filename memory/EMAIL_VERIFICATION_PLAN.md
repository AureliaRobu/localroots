# Email Verification Implementation Plan

## Overview
Add email verification to LocalRoots using Resend. Users must verify their email before logging in (credentials). OAuth users (Google/Facebook) are auto-verified.

## Configuration
- **Email Provider**: Resend
- **Login Behavior**: Block until verified
- **OAuth Users**: Auto-verified

---

## Implementation Steps

### 1. Database Schema
**File:** `prisma/schema.prisma`

Add VerificationToken model:
```prisma
model VerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@unique([email, token])
  @@index([email])
  @@index([expires])
  @@map("verification_tokens")
}
```

Then run:
```bash
npm install resend
npx prisma db push
npx prisma generate
```

---

### 2. Email Service

#### 2.1 Resend Client
**New file:** `lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
export const EMAIL_FROM = process.env.EMAIL_FROM || 'LocalRoots <noreply@localroots.com>'
```

#### 2.2 Email Template
**New file:** `lib/email/templates/verification-email.ts`

```typescript
interface VerificationEmailProps {
  name: string
  verificationUrl: string
}

export function getVerificationEmailHtml({ name, verificationUrl }: VerificationEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Verify your email</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a;">Welcome to LocalRoots!</h1>
          <p>Hi ${name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #16a34a; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link: <span style="word-break: break-all;">${verificationUrl}</span></p>
          <p>This link expires in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `
}
```

#### 2.3 Verification Logic
**New file:** `lib/email/verification.ts`

```typescript
'use server'

import { randomBytes } from 'crypto'
import prisma from '@/lib/db/prisma'
import { resend, EMAIL_FROM } from './resend'
import { getVerificationEmailHtml } from './templates/verification-email'

const TOKEN_EXPIRY_HOURS = 24

export async function generateVerificationToken(email: string): Promise<string> {
  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({ where: { email } })

  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.verificationToken.create({
    data: { email, token, expires }
  })

  return token
}

export async function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify your email address - LocalRoots',
      html: getVerificationEmailHtml({ name: name || 'there', verificationUrl })
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error: 'Failed to send verification email' }
  }
}

export async function verifyToken(token: string): Promise<{
  success: boolean
  email?: string
  error?: string
}> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return { success: false, error: 'Invalid verification token' }
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } })
    return { success: false, error: 'Verification token has expired' }
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() }
  })

  // Delete used token
  await prisma.verificationToken.delete({ where: { id: verificationToken.id } })

  return { success: true, email: verificationToken.email }
}
```

---

### 3. Update Registration Action
**File:** `lib/actions/auth.ts`

Modify `registerAction`:
1. Create user (emailVerified = null)
2. Generate verification token
3. Send verification email
4. Return `{ success: true, requiresVerification: true }` (NO auto sign-in)

Add new actions:
- `resendVerificationEmail(email)` - Resend verification email
- `verifyEmailAction(token)` - Wrapper for verifyToken

---

### 4. Update Login Action
**File:** `lib/actions/auth.ts`

Modify `loginAction`:
1. Validate credentials first (don't reveal if user exists)
2. Check `emailVerified` status
3. If not verified: return `{ success: false, needsVerification: true, email }`
4. If verified: proceed with NextAuth signIn

---

### 5. Auto-Verify OAuth Users
**File:** `lib/auth/auth.config.ts`

Add `events.linkAccount` handler:
```typescript
events: {
  async linkAccount({ user, account }) {
    if (account.provider === 'google' || account.provider === 'facebook') {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  }
}
```

---

### 6. Create Verification Pages

#### 6.1 Token Verification Page
**New file:** `app/[locale]/(auth)/verify-email/page.tsx`

- Reads `token` from URL params
- Calls `verifyEmailAction(token)`
- Shows loading → success/error states
- Redirects to `/login?verified=true` on success

#### 6.2 Check Email Page
**New file:** `app/[locale]/(auth)/verify-email/sent/page.tsx`

- Shows "Check your email" message
- Reads `email` from URL params
- Has "Resend verification email" button
- Links back to registration for wrong email

---

### 7. Update Auth Pages

#### 7.1 Registration Page
**File:** `app/[locale]/(auth)/register/page.tsx`

On success, redirect to `/verify-email/sent?email=...` instead of dashboard.

#### 7.2 Login Page
**File:** `app/[locale]/(auth)/login/page.tsx`

- Handle `?verified=true` query param → show success toast
- Handle `needsVerification` response → show verification banner with resend link

---

### 8. Add Translations
**Files:** `messages/en.json`, `messages/es.json`, `messages/fr.json`

Add to `auth` section:
```json
{
  "auth": {
    "login": {
      "emailVerified": "Email verified successfully! You can now sign in.",
      "verificationRequired": "Email verification required",
      "checkInbox": "Please check your inbox and click the verification link.",
      "resendVerification": "Resend verification email",
      "sendingVerification": "Sending...",
      "verificationSent": "Verification email sent!"
    },
    "verifyEmail": {
      "title": "Check your email",
      "description": "We've sent a verification link to {email}",
      "instructions": "Click the link in the email to verify your account. The link expires in 24 hours.",
      "resendButton": "Resend verification email",
      "resending": "Sending...",
      "resendSuccess": "Verification email sent!",
      "resendError": "Failed to send email. Please try again.",
      "wrongEmail": "Wrong email?",
      "tryAgain": "Try registering again",
      "verifying": "Verifying your email",
      "pleaseWait": "Please wait...",
      "successTitle": "Email verified!",
      "successDescription": "Your email has been verified successfully.",
      "redirecting": "Redirecting to login...",
      "errorTitle": "Verification failed",
      "genericError": "Something went wrong. Please try again.",
      "noToken": "No verification token provided.",
      "backToLogin": "Back to login"
    }
  }
}
```

---

### 9. Environment Variables
Add to `.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="LocalRoots <noreply@yourdomain.com>"
```

---

## Files Summary

### Files to Modify
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add VerificationToken model |
| `lib/actions/auth.ts` | Update register/login, add verification actions |
| `lib/auth/auth.config.ts` | Add OAuth auto-verification event |
| `app/[locale]/(auth)/register/page.tsx` | Redirect to verify-email/sent |
| `app/[locale]/(auth)/login/page.tsx` | Handle verification states |
| `messages/en.json` | Add verification translations |
| `messages/es.json` | Add verification translations |
| `messages/fr.json` | Add verification translations |

### New Files to Create
| File | Purpose |
|------|---------|
| `lib/email/resend.ts` | Resend client |
| `lib/email/templates/verification-email.ts` | Email HTML template |
| `lib/email/verification.ts` | Token logic |
| `app/[locale]/(auth)/verify-email/page.tsx` | Token verification page |
| `app/[locale]/(auth)/verify-email/sent/page.tsx` | "Check email" page |

---

## Testing Checklist

- [ ] **Register new user** → Receives email, redirected to "check email" page
- [ ] **Click verification link** → Email verified, redirected to login
- [ ] **Login unverified** → Blocked with message, resend link works
- [ ] **Login verified** → Success, redirected to dashboard
- [ ] **Google signup** → Auto-verified, can login immediately
- [ ] **Facebook signup** → Auto-verified, can login immediately
- [ ] **Expired token** → Shows error, can request new email
- [ ] **Invalid token** → Shows error message
- [ ] **Resend from login** → New email sent
- [ ] **Resend from sent page** → New email sent
