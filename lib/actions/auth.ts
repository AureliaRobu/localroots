'use server'

import { signIn } from '@/lib/auth/auth'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import { AuthError } from 'next-auth'
import prisma from '@/lib/db/prisma'
import { getUserByEmail } from '@/lib/db/users'
import bcrypt from 'bcryptjs'

type LoginResult =
  | { success: true }
  | { success: false; error: string }

export async function loginAction(data: unknown): Promise<LoginResult> {
  try {
    // 1. Validate input on server
    const validated = loginSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        error: 'Invalid input. Please check your email and password.'
      }
    }

    const { email, password } = validated.data

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // 3. Attempt sign in with NextAuth
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    // 4. Return success
    return { success: true }

  } catch (error) {
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Invalid email or password'
          }
        case 'CallbackRouteError':
          return {
            success: false,
            error: 'Invalid email or password'
          }
        default:
          console.error('Authentication error:', error)
          return {
            success: false,
            error: 'Authentication failed. Please try again.'
          }
      }
    }

    // Handle unexpected errors
    console.error('Unexpected login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

type RegisterResult =
  | { success: true }
  | { success: false; error: string }

export async function registerAction(data: unknown): Promise<RegisterResult> {
  try {
    // 1. Validate input on server
    const validated = registerSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        error: 'Invalid input. Please check all fields.'
      }
    }

    const { name, email, password } = validated.data

    // 2. Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create user (role defaults to USER in schema)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // 5. Auto sign in after registration
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    // 6. Return success
    return { success: true }

  } catch (error) {
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      console.error('Authentication error after registration:', error)
      return {
        success: false,
        error: 'Account created but sign-in failed. Please try logging in.'
      }
    }

    // Handle unexpected errors
    console.error('Unexpected registration error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}
