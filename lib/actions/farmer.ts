'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireFarmer } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { farmerProfileSchema, type FarmerProfileFormData } from '@/lib/validations/farmer'

export async function createFarmerProfile(data: FarmerProfileFormData) {
    try {
        // Validate data
        const validatedData = farmerProfileSchema.parse(data)

        // Check authentication
        const user = await requireFarmer()

        // Check if profile already exists
        const existingProfile = await prisma.farmerProfile.findUnique({
            where: { userId: user.id }
        })

        if (existingProfile) {
            return {
                success: false,
                error: 'Profile already exists'
            }
        }

        // Create profile
        const profile = await prisma.farmerProfile.create({
            data: {
                userId: user.id,
                farmName: validatedData.farmName,
                description: validatedData.description,
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                country: validatedData.country,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                phone: validatedData.phone,
                website: validatedData.website || null,
            },
        })

        revalidatePath('/farmer/dashboard')

        return {
            success: true,
            data: profile
        }
    } catch (error) {
        console.error('Error creating farmer profile:', error)
        return {
            success: false,
            error: 'Failed to create profile. Please try again.'
        }
    }
}

export async function updateFarmerProfile(data: FarmerProfileFormData) {
    try {
        // Validate data
        const validatedData = farmerProfileSchema.parse(data)

        // Check authentication
        const user = await requireFarmer()

        // Update profile
        const profile = await prisma.farmerProfile.update({
            where: { userId: user.id },
            data: {
                farmName: validatedData.farmName,
                description: validatedData.description,
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                zipCode: validatedData.zipCode,
                country: validatedData.country,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                phone: validatedData.phone,
                website: validatedData.website || null,
            },
        })

        revalidatePath('/farmer/dashboard')

        return {
            success: true,
            data: profile
        }
    } catch (error) {
        console.error('Error updating farmer profile:', error)
        return {
            success: false,
            error: 'Failed to update profile. Please try again.'
        }
    }
}