
import prisma from '@/lib/db/prisma'

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
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
                            }
                        }
                    }
                }
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
                            }
                        }
                    }
                }
            }
        })
        return product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}