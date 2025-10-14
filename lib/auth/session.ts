import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
    const session = await auth()
    return session?.user
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/login')
    }
    return user
}

export async function requireFarmer() {
    const user = await requireAuth()
    if (user.role !== UserRole.FARMER) {
        redirect('/products')
    }
    return user
}