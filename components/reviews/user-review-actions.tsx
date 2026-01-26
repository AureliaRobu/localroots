import { getCurrentUser } from '@/lib/auth/session'
import { canReviewProduct } from '@/lib/actions/review'
import { ReviewSummary } from './review-summary'
import { ReviewsList } from './reviews-list'
import { Card } from '@/components/ui/card'
import prisma from '@/lib/db/prisma'
import type { ReviewWithUser } from '@/types'

interface UserReviewActionsProps {
    productId: string
    averageRating: number | null
    reviewCount: number
}

// This component handles user-specific review logic
// It's loaded dynamically via Suspense to allow the rest of the page to be cached
export async function UserReviewActions({
    productId,
    averageRating,
    reviewCount,
}: UserReviewActionsProps) {
    // User-specific data - prevents page caching but runs in Suspense boundary
    const currentUser = await getCurrentUser()
    const canReviewResult = await canReviewProduct(productId)
    const canReview = canReviewResult.success && canReviewResult.data?.canReview || false
    const orderId = canReviewResult.success && canReviewResult.data?.orderId || undefined

    // Fetch reviews with all required fields for ReviewWithUser type
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
        orderBy: { createdAt: 'desc' },
        take: 10,
    })

    const totalReviews = await prisma.review.count({ where: { productId } })

    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const allRatings = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
    })
    allRatings.forEach((review) => {
        ratingDistribution[review.rating]++
    })

    // Reviews already match ReviewWithUser type from Prisma include
    const formattedReviews: ReviewWithUser[] = reviews

    return (
        <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

            {averageRating && totalReviews > 0 ? (
                <ReviewSummary
                    averageRating={averageRating}
                    totalReviews={totalReviews}
                    ratingDistribution={ratingDistribution}
                    canReview={canReview}
                    productId={productId}
                    orderId={orderId}
                />
            ) : (
                <Card className="p-6 text-center">
                    <p className="text-gray-500">No reviews yet</p>
                    {canReview && orderId && (
                        <ReviewSummary
                            averageRating={0}
                            totalReviews={0}
                            ratingDistribution={ratingDistribution}
                            canReview={canReview}
                            productId={productId}
                            orderId={orderId}
                        />
                    )}
                </Card>
            )}

            {totalReviews > 0 && (
                <div className="mt-8">
                    <ReviewsList
                        initialReviews={formattedReviews}
                        productId={productId}
                        orderId={orderId}
                        currentUserId={currentUser?.id}
                        totalCount={totalReviews}
                    />
                </div>
            )}
        </div>
    )
}

// Loading skeleton for Suspense fallback
export function UserReviewActionsSkeleton() {
    return (
        <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
            <div className="animate-pulse">
                <div className="h-32 bg-slate-200 rounded-lg mb-4" />
                <div className="space-y-4">
                    <div className="h-24 bg-slate-200 rounded-lg" />
                    <div className="h-24 bg-slate-200 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
