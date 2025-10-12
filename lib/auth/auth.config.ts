import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db/prisma'
import { LoginFormData } from '@/types'
import { UserRole } from '@prisma/client'

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const { email, password } = credentials as LoginFormData

                // Find user
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { farmerProfile: true }
                })

                if (!user || !user.password) {
                    return null
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(password, user.password)

                if (!isPasswordValid) {
                    return null
                }

                // Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers, ensure user exists in our database
            if (account?.provider !== 'credentials') {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! }
                })

                if (!existingUser) {
                    // Create new user for OAuth sign-in
                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name,
                            image: user.image,
                            role: UserRole.CUSTOMER, // Default role
                            emailVerified: new Date(),
                        }
                    })
                }
            }
            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                // Fetch user role from database
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! }
                })

                if (dbUser) {
                    token.role = dbUser.role
                    token.id = dbUser.id
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as UserRole
                session.user.id = token.id as string
            }
            return session
        }
    }
} satisfies NextAuthConfig