import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db/prisma'
import { LoginFormData } from '@/types'
import type { UserRole } from '@prisma/client'

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
                    include: { sellerProfile: true }
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
        async redirect({ url, baseUrl }) {
            // Handle OAuth callback redirects - always go to buying dashboard
            if (url === baseUrl || url === `${baseUrl}/`) {
                return `${baseUrl}/dashboard/buying`
            }
            // Allow URLs on the same origin
            if (url.startsWith(baseUrl)) {
                return url
            }
            // Allow relative URLs
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`
            }
            return baseUrl
        },
        async jwt({ token, user }) {
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

                // Create a Socket.io-compatible JWT token
                // This token is used for WebSocket authentication
                if (process.env.AUTH_SECRET) {
                    session.accessToken = jwt.sign(
                        {
                            sub: token.id,
                            role: token.role,
                            email: token.email
                        },
                        process.env.AUTH_SECRET,
                        { expiresIn: '7d' }
                    )
                }
            }
            return session
        }
    }
} satisfies NextAuthConfig