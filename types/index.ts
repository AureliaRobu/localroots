import { User, UserRole, FarmerProfile, Product } from '@prisma/client'

// Export Prisma types
export type { User, UserRole, FarmerProfile, Product }

// Extended types with relations
export type UserWithProfile = User & {
    farmerProfile?: FarmerProfile | null
}

export type ProductWithFarmer = Product & {
    farmer: User & {
        farmerProfile?: FarmerProfile | null
    }
}

// Form types
export type RegisterFormData = {
    email: string
    password: string
    name: string
    role: UserRole
}

export type LoginFormData = {
    email: string
    password: string
}

export type FarmerProfileFormData = {
    farmName: string
    description?: string
    address: string
    city: string
    state?: string
    zipCode?: string
    country: string
    latitude: number
    longitude: number
    phone?: string
    website?: string
}

export type ProductFormData = {
    name: string
    description?: string
    price: number
    unit: string
    category: string
    imageUrl?: string
    inStock: boolean
}