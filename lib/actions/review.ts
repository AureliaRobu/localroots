'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { reviewSchema, updateReviewSchema } from '@/lib/validations/review'
import type { ReviewFormData, UpdateReviewFormData } from '@/lib/validations/review'

/**
 * Create a new review for a product
 */
export async function createReview(formData: ReviewFormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate form data
    const validatedData = reviewSchema.parse(formData)

    // Verify order exists, is COMPLETED, and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        items: {
          where: { productId: validatedData.productId },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    if (order.status !== 'COMPLETED') {
      return { success: false, error: 'Can only review completed orders' }
    }

    // Verify product is in the order
    if (order.items.length === 0) {
      return { success: false, error: 'Product not found in order' }
    }

    // Check if review already exists (unique constraint)
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: validatedData.productId,
        },
      },
    })

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this product' }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment || null,
        userId: user.id,
        productId: validatedData.productId,
        orderId: validatedData.orderId,
        isVerified: true,
      },
    })

    // Update product rating aggregates
    await updateProductRatingAggregates(validatedData.productId)

    // Revalidate paths
    revalidatePath(`/products/${validatedData.productId}`)
    revalidatePath('/customer/orders')
    revalidatePath(`/orders/${validatedData.orderId}`)

    return { success: true, data: review }
  } catch (error) {
    console.error('Error creating review:', error)
    return { success: false, error: 'Failed to create review' }
  }
}

/**
 * Update an existing review
 */
export async function updateReview(formData: UpdateReviewFormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate form data
    const validatedData = updateReviewSchema.parse(formData)

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: validatedData.reviewId },
    })

    if (!existingReview) {
      return { success: false, error: 'Review not found' }
    }

    // Verify ownership
    if (existingReview.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: validatedData.reviewId },
      data: {
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment || null,
      },
    })

    // Recalculate product rating aggregates
    await updateProductRatingAggregates(existingReview.productId)

    // Revalidate paths
    revalidatePath(`/products/${existingReview.productId}`)
    revalidatePath('/customer/orders')
    revalidatePath(`/orders/${existingReview.orderId}`)

    return { success: true, data: review }
  } catch (error) {
    console.error('Error updating review:', error)
    return { success: false, error: 'Failed to update review' }
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!existingReview) {
      return { success: false, error: 'Review not found' }
    }

    // Verify ownership or admin
    if (existingReview.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Recalculate product rating aggregates
    await updateProductRatingAggregates(existingReview.productId)

    // Revalidate paths
    revalidatePath(`/products/${existingReview.productId}`)
    revalidatePath('/customer/orders')
    revalidatePath(`/orders/${existingReview.orderId}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting review:', error)
    return { success: false, error: 'Failed to delete review' }
  }
}

/**
 * Get reviews for a product with pagination and sorting
 */
export async function getProductReviews(
  productId: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: 'recent' | 'highest' | 'lowest'
  }
) {
  try {
    const limit = options?.limit || 10
    const offset = options?.offset || 0
    const sortBy = options?.sortBy || 'recent'

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'highest') {
      orderBy = { rating: 'desc' }
    } else if (sortBy === 'lowest') {
      orderBy = { rating: 'asc' }
    }

    // Get reviews with user data
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const totalCount = await prisma.review.count({
      where: { productId },
    })

    return {
      success: true,
      data: {
        reviews,
        totalCount,
        hasMore: offset + limit < totalCount,
      },
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

/**
 * Check if the current user can review a product
 */
export async function canReviewProduct(productId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: true,
        data: {
          canReview: false,
          reason: 'Not authenticated',
        },
      }
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existingReview) {
      return {
        success: true,
        data: {
          canReview: false,
          reason: 'Already reviewed',
          reviewId: existingReview.id,
        },
      }
    }

    // Check if user has a COMPLETED order with this product
    const completedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        id: true,
      },
    })

    if (!completedOrder) {
      return {
        success: true,
        data: {
          canReview: false,
          reason: 'No completed order with this product',
        },
      }
    }

    return {
      success: true,
      data: {
        canReview: true,
        orderId: completedOrder.id,
      },
    }
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return { success: false, error: 'Failed to check review eligibility' }
  }
}

/**
 * Helper: Update product rating aggregates (average and count)
 */
async function updateProductRatingAggregates(productId: string) {
  try {
    // Get all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    const reviewCount = reviews.length
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : null

    // Update product
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating,
        reviewCount,
      },
    })
  } catch (error) {
    console.error('Error updating product rating aggregates:', error)
    throw error
  }
}
