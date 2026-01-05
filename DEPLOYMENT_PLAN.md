# Deployment Plan - December 18, 2025
## LocalRoots Chat System Production Deployment

**Current Status:** End of Phase 2 (Socket.io server built, build error on Vercel)

**Goal:** Deploy Next.js app to Vercel + Socket.io server to Railway

**Estimated Time:** 2-3 hours

---

## Pre-Deployment Checklist

- [ ] Confirm Socket.io server runs locally (`cd server && npm run dev`)
- [ ] Confirm Next.js app runs locally (`npm run dev`)
- [ ] Confirm Redis is accessible (local or cloud)
- [ ] Have GitHub repository ready
- [ ] Create accounts: Vercel, Railway, Upstash (if needed)

---

## Phase 1: Fix Build Error (15 minutes)

### Issue
Next.js is trying to compile `/server` directory, causing:
```
Cannot find module 'socket.io' or its corresponding type declarations
```

### Solution

**Step 1.1:** Exclude server directory from Next.js TypeScript compilation

Edit `tsconfig.json`:
```json
"exclude": [
  "node_modules",
  "server"
]
```

**Step 1.2:** Create `.vercelignore` file (prevents uploading server to Vercel)

```bash
server/
CHAT_IMPLEMENTATION_PLAN.md
REVIEWS_IMPLEMENTATION_PLAN.md
REALTIME_LEARNING_GUIDE.md
DEPLOYMENT_PLAN.md
```

**Step 1.3:** Test build locally

```bash
npm run build
```

Should complete without errors.

**Step 1.4:** Commit changes

```bash
git add tsconfig.json .vercelignore
git commit -m "fix: exclude server directory from Next.js build"
git push origin main
```

---

## Phase 2: Set Up Managed Redis (20 minutes)

**Option A: Upstash (Recommended - Serverless)**

1. Go to https://upstash.com
2. Sign up / Log in
3. Create new Redis database
   - Name: `localroots-chat-redis`
   - Region: Choose closest to your Socket.io server location
4. Copy connection URL (format: `redis://...`)

**Option B: Railway Redis (Simpler if using Railway)**

Skip this phase - will add Redis addon when deploying Socket.io server in Phase 3.

**Save for later:**
```
REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379
```

---

## Phase 3: Deploy Socket.io Server to Railway (30 minutes)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps

**Step 3.1:** Prepare server for deployment

Check `/server/package.json` has correct scripts:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Step 3.2:** Create Railway project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select `localroots` repository

**Step 3.3:** Configure service

1. Railway will detect multiple services - select "Empty Service"
2. Click on service → Settings
3. Set **Root Directory**: `server`
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm start`

**Step 3.4:** Add Redis addon (if not using Upstash)

1. In Railway project dashboard, click "New"
2. Select "Database" → "Redis"
3. Railway auto-generates `REDIS_URL` environment variable

**Step 3.5:** Set environment variables

In Railway service → Variables tab, add:

```bash
NODE_ENV=production
SOCKET_PORT=3001
DATABASE_URL=your-postgres-url (copy from Vercel env)
DIRECT_URL=your-postgres-direct-url (copy from Vercel env)
AUTH_SECRET=your-auth-secret (copy from Vercel env)
REDIS_URL=redis://... (from Railway Redis or Upstash)
```

**Step 3.6:** Deploy

1. Click "Deploy" or push to GitHub (auto-deploys)
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a public URL: `https://your-app.railway.app`

**Step 3.7:** Test Socket.io server

Open browser console or use tool like Postman WebSocket:
```javascript
const socket = io('https://your-app.railway.app');
// Should connect (will fail auth without token, but proves server is up)
```

**Save for Next Phase:**
```
Socket.io Server URL: https://xxxxx-production.up.railway.app
```

---

## Phase 4: Deploy Next.js App to Vercel (20 minutes)

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Build error fixed (Phase 1 completed)

### Steps

**Step 4.1:** Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Import your `localroots` repository
3. Vercel auto-detects Next.js configuration

**Step 4.2:** Configure build settings

- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Root Directory:** `.` (leave empty)

**Step 4.3:** Set environment variables

Add ALL environment variables from your `.env` file:

```bash
# Database (Neon/Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
AUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app (will be provided by Vercel)

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# AWS S3
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=localroots-product-images

# Socket.io (NEW - from Phase 3)
NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
```

**Important:** `NEXT_PUBLIC_SOCKET_URL` must be the Railway URL from Phase 3.

**Step 4.4:** Deploy

1. Click "Deploy"
2. Wait for deployment (~2-3 minutes)
3. Vercel provides production URL: `https://your-app.vercel.app`

**Step 4.5:** Update NEXTAUTH_URL

1. Copy your Vercel production URL
2. Go to Vercel → Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (Vercel → Deployments → Click "..." → Redeploy)

---

## Phase 5: Configure CORS and Origins (15 minutes)

### Update Socket.io server for production CORS

**Step 5.1:** Update `/server/src/server.ts`

Make sure CORS allows your Vercel domain:

```typescript
const io = new Server({
  cors: {
    origin: [
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'https://your-app.vercel.app', // Add your Vercel URL
      'https://*.vercel.app' // Allow preview deployments
    ],
    credentials: true
  },
  adapter: createAdapter(pubClient, subClient)
});
```

**Step 5.2:** Commit and push

```bash
git add server/src/server.ts
git commit -m "feat: add production CORS origins"
git push origin main
```

Railway will auto-redeploy.

---

## Phase 6: Test Production Deployment (30 minutes)

### Manual Testing Checklist

**Test 6.1: Next.js App**
- [ ] Visit Vercel URL, app loads
- [ ] Login works (credentials + OAuth)
- [ ] Farmer dashboard accessible
- [ ] Product pages load
- [ ] Images load from S3

**Test 6.2: Socket.io Connection**
- [ ] Open browser DevTools → Network → WS (WebSocket)
- [ ] Navigate to chat page (when built)
- [ ] Should see WebSocket connection to Railway URL
- [ ] Connection status should show "Connected"

**Test 6.3: Real-time Chat (if UI built)**
- [ ] Open two browser windows (different users)
- [ ] Send message from User A
- [ ] Message appears in User B's window in real-time
- [ ] Typing indicators work
- [ ] User presence shows online/offline

**Test 6.4: Database Persistence**
- [ ] Send messages
- [ ] Refresh page
- [ ] Messages persist and load from database

---

## Phase 7: Environment Variable Security (10 minutes)

### Audit and Secure Secrets

**Step 7.1:** Verify no secrets in Git

```bash
git log --all --full-history -- .env
```

Should be empty (`.env` in `.gitignore`).

**Step 7.2:** Rotate secrets if needed

If you accidentally committed secrets:
1. Generate new `AUTH_SECRET`
2. Regenerate OAuth credentials
3. Update in both Vercel and Railway

**Step 7.3:** Document environment variables

Create a secure note (1Password, Bitwarden) with all production env vars for backup.

---

## Phase 8: Monitoring Setup (Optional - 20 minutes)

### Railway Monitoring

1. Railway dashboard shows:
   - CPU/Memory usage
   - Logs (View → Logs)
   - Deployment status

### Vercel Monitoring

1. Vercel dashboard shows:
   - Build logs
   - Function invocations
   - Error tracking (upgrade to Pro for more)

### Uptime Monitoring (Optional)

1. Sign up for UptimeRobot (free)
2. Add monitors:
   - Next.js app (HTTPS): `https://your-app.vercel.app`
   - Socket.io server (HTTPS): `https://your-app.railway.app`
3. Get email alerts if services go down

---

## Troubleshooting Guide

### Issue: Railway build fails

**Symptoms:** Build logs show TypeScript errors

**Solution:**
- Check `/server/tsconfig.json` exists and is valid
- Verify all dependencies in `/server/package.json`
- Check Railway build logs for specific error

### Issue: Socket.io connection fails (CORS)

**Symptoms:** Browser console shows CORS error

**Solution:**
- Update CORS origins in `/server/src/server.ts`
- Add Vercel URL to allowed origins
- Redeploy Railway service

### Issue: Authentication fails on Socket.io

**Symptoms:** "Invalid authentication token" error

**Solution:**
- Verify `AUTH_SECRET` matches in Vercel and Railway
- Check JWT token is being sent from Next.js client
- Verify `session.accessToken` is exposed in NextAuth callbacks

### Issue: Redis connection fails

**Symptoms:** Socket.io server crashes, logs show Redis error

**Solution:**
- Verify `REDIS_URL` environment variable is set
- Test Redis connection: `redis-cli -u $REDIS_URL ping`
- Check Redis service is running (Upstash dashboard or Railway)

### Issue: Database queries fail from Socket.io server

**Symptoms:** "Can't reach database server" error

**Solution:**
- Verify `DATABASE_URL` is set in Railway
- If using Neon: Use `DIRECT_URL` for Socket.io server (bypasses pooler)
- Check database service is accessible from Railway's IP range

---

## Post-Deployment Tasks (Future)

- [ ] Set up custom domain (Vercel + Railway)
- [ ] Configure SSL certificates (auto with Railway)
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation (Logtail, Papertrail)
- [ ] Load testing (Artillery, k6)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Database backup strategy (Neon automatic backups)
- [ ] Implement rate limiting on Socket.io
- [ ] Add message queue for failed message delivery (BullMQ + Redis)

---

## Cost Breakdown (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Railway | Starter | $5 |
| Upstash Redis | Pay-as-you-go | $0-5 |
| Neon PostgreSQL | Free tier | $0 |
| **Total** | | **~$5-10/month** |

---

## Success Criteria

✅ Next.js app deployed and accessible at Vercel URL
✅ Socket.io server deployed and running on Railway
✅ Redis connected and operational
✅ WebSocket connection established from Next.js to Socket.io
✅ No build or runtime errors in logs
✅ All environment variables configured correctly
✅ CORS configured for production domains

---

## Next Steps (After Deployment)

1. Continue with **Phase 3** of CHAT_IMPLEMENTATION_PLAN.md (Authentication Middleware)
2. Build Phase 5 client-side UI components
3. Test real-time chat functionality end-to-end
4. Implement typing indicators and presence
5. Build group chat features (Phase 4 handlers)

---

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Upstash Documentation](https://docs.upstash.com/redis)

---

**Created:** December 17, 2025
**Status:** Ready to execute
**Priority:** High (blocking Vercel deployment)
