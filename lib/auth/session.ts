import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/db/prisma'

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

export async function requireAdmin() {
    const user = await requireAuth()
    if (user.role !== UserRole.ADMIN) {
        redirect('/dashboard/buying')
    }
    return user
}

export async function requireSellerProfile() {
    const user = await requireAuth()

    const profile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id }
    })

    if (!profile) {
        redirect('/dashboard/selling/profile/setup')
    }

    return { user, profile }
}

export async function getSellerProfile(userId: string) {
    return prisma.sellerProfile.findUnique({
        where: { userId }
    })
}

export async function hasSellerProfile(userId: string) {
    const profile = await prisma.sellerProfile.findUnique({
        where: { userId },
        select: { id: true }
    })
    return !!profile
}
