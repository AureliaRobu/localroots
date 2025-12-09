
'use server'

import { revalidatePath } from 'next/cache'
import { requireFarmer } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { getClosestProducts } from '@/lib/db/products'

export async function createProduct(data: ProductFormData) {
    try {
        // Validate data
        const validatedData = productSchema.parse(data)

        // Check authentication
        const user = await requireFarmer()

        // Check if farmer has a profile
        const farmerProfile = await prisma.farmerProfile.findUnique({
            where: { userId: user.id }
        })

        if (!farmerProfile) {
            return {
                success: false,
                error: 'Please complete your farmer profile first'
            }
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                unit: validatedData.unit,
                category: validatedData.category,
                imageUrl: validatedData.imageUrl || null,
                inStock: validatedData.inStock,
                farmerId: user.id,
            },
        })

        // Revalidate pages that display products
        revalidatePath('/products')
        revalidatePath('/farmer/products')

        return {
            success: true,
            data: product
        }
    } catch (error) {
        console.error('Error creating product:', error)
        return {
            success: false,
            error: 'Failed to create product. Please try again.'
        }
    }
}

export async function updateProduct(id: string, data: ProductFormData) {
    try {
        // Validate data
        const validatedData = productSchema.parse(data)

        // Check authentication
        const user = await requireFarmer()

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        })

        if (!existingProduct) {
            return {
                success: false,
                error: 'Product not found'
            }
        }

        if (existingProduct.farmerId !== user.id) {
            return {
                success: false,
                error: 'Unauthorized'
            }
        }

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                price: validatedData.price,
                unit: validatedData.unit,
                category: validatedData.category,
                imageUrl: validatedData.imageUrl || null,
                inStock: validatedData.inStock,
            },
        })

        // Revalidate pages
        revalidatePath('/products')
        revalidatePath(`/products/${id}`)
        revalidatePath('/farmer/products')

        return {
            success: true,
            data: product
        }
    } catch (error) {
        console.error('Error updating product:', error)
        return {
            success: false,
            error: 'Failed to update product. Please try again.'
        }
    }
}

export async function deleteProduct(id: string) {
    try {
        // Check authentication
        const user = await requireFarmer()

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        })

        if (!existingProduct) {
            return {
                success: false,
                error: 'Product not found'
            }
        }

        if (existingProduct.farmerId !== user.id) {
            return {
                success: false,
                error: 'Unauthorized'
            }
        }

        // Delete product
        await prisma.product.delete({
            where: { id }
        })

        // Revalidate pages
        revalidatePath('/products')
        revalidatePath('/farmer/products')

        return {
            success: true
        }
    } catch (error) {
        console.error('Error deleting product:', error)
        return {
            success: false,
            error: 'Failed to delete product. Please try again.'
        }
    }
}

export async function getClosestProductsAction(latitude: number, longitude: number, limit?: number) {
    try {
        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return {
                success: false,
                error: 'Invalid coordinates provided'
            }
        }

        if (isNaN(latitude) || isNaN(longitude)) {
            return {
                success: false,
                error: 'Invalid latitude or longitude'
            }
        }

        const products = await getClosestProducts(latitude, longitude, limit || 6)

        return {
            success: true,
            data: products
        }
    } catch (error) {
        console.error('Error fetching closest products:', error)
        return {
            success: false,
            error: 'Failed to fetch closest products'
        }
    }
}