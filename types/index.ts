import { User, UserRole, SellerProfile, Product, Review } from '@prisma/client'

// Export Prisma types
export type { User, UserRole, SellerProfile, Product, Review }

// Backward compatibility alias
export type FarmerProfile = SellerProfile

// Extended types with relations
export type UserWithProfile = User & {
    sellerProfile?: SellerProfile | null
}

export type ProductWithFarmer = Product & {
    farmer: User & {
        sellerProfile?: SellerProfile | null
    }
}

export type ReviewWithUser = Review & {
    user: {
        id: string
        name: string | null
        image: string | null
    }
}

// Re-export validation types
export type { LoginFormData, RegisterFormData } from '@/lib/validations/auth'
export type { ReviewFormData, UpdateReviewFormData } from '@/lib/validations/review'

// Other form types
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