import prisma from '@/lib/db/prisma'
import { User } from '@prisma/client'

/**
 * Get a user by email address
 * @param email - The email address to search for
 * @returns User or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error('Error fetching user by email:', error)
        return null
    }
}

/**
 * Get a user by ID
 * @param id - The user ID to search for
 * @returns User or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        })
        return user
    } catch (error) {
        console.error('Error fetching user by ID:', error)
        return null
    }
}
