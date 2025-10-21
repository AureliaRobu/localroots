import prisma from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'

export type ProductFilters = {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    userLat?: number
    userLon?: number
    maxDistance?: number // in kilometers
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export async function getProducts(filters?: ProductFilters) {
    try {
        const where: Prisma.ProductWhereInput = {}

        // Search filter
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ]
        }

        // Category filter
        if (filters?.category && filters.category !== 'all') {
            where.category = filters.category
        }

        // Price range filter
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {}
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice
            }
        }

        // Stock filter
        if (filters?.inStock !== undefined) {
            where.inStock = filters.inStock
        }

        let products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                farmer: {
                    select: {
                        name: true,
                        farmerProfile: {
                            select: {
                                farmName: true,
                                city: true,
                                state: true,
                                latitude: true,
                                longitude: true,
                            },
                        },
                    },
                },
            },
        })

        // Distance filter (client-side filtering after fetch)
        if (filters?.userLat && filters?.userLon && filters?.maxDistance) {
            products = products.filter((product) => {
                if (!product.farmer.farmerProfile) return false

                const distance = calculateDistance(
                    filters.userLat!,
                    filters.userLon!,
                    product.farmer.farmerProfile.latitude,
                    product.farmer.farmerProfile.longitude
                )

                return distance <= filters.maxDistance!
            })
        }

        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}


export async function getProductById(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        farmerProfile: {
                            select: {
                                farmName: true,
                                description: true,
                                city: true,
                                state: true,
                                phone: true,
                                website: true,
                            },
                        },
                    },
                },
            },
        })
        return product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

// Get unique categories
export async function getProductCategories() {
    try {
        const categories = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        })
        return categories.map((c) => c.category)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}