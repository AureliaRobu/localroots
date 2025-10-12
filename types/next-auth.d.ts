import { UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: UserRole
            email: string
            name?: string | null
            image?: string | null
        } & DefaultSession['user']
    }

    interface User {
        id: string
        role: UserRole
        email: string
        name?: string | null
        image?: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string
        role: UserRole
    }
}

declare module '@auth/core/adapters' {
    interface AdapterUser {
        role: UserRole
    }
}