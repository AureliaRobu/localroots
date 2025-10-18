import prisma from '@/lib/db/prisma'

export type ProductFilters = {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
}

export async function getProducts(filters?: ProductFilters) {
    try {
        const where: any = {}

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

        const products = await prisma.product.findMany({
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
                            },
                        },
                    },
                },
            },
        })
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