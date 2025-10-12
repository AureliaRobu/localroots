import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db/prisma'
import { LoginFormData } from '@/types'
import {UserRole} from "@prisma/client";

export default {
    providers: [
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
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
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