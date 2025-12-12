'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StarRating } from './star-rating'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReviewForm } from './review-form'
import { cn } from '@/lib/utils'

interface RatingDistribution {
  [key: number]: number
}

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution
  canReview: boolean
  productId: string
  orderId?: string
  onReviewSuccess?: () => void
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
  canReview,
  productId,
  orderId,
  onReviewSuccess,
}: ReviewSummaryProps) {
  const t = useTranslations('reviews')
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  const handleReviewSuccess = () => {
    setShowReviewDialog(false)
    onReviewSuccess?.()
  }

  // Calculate percentages for rating distribution
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0
    return ((ratingDistribution[rating] || 0) / totalReviews) * 100
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center border-r pr-6">
            <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size="lg" className="mt-2" />
            <p className="mt-2 text-sm text-gray-600">
              {t('basedOn', { count: totalReviews })}
            </p>
            {canReview && orderId && (
              <Button
                onClick={() => setShowReviewDialog(true)}
                className="mt-4"
              >
                {t('writeReview')}
              </Button>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = getRatingPercentage(rating)
              const count = ratingDistribution[rating] || 0

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-12 text-sm">{rating} {t('stars')}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          rating >= 4
                            ? 'bg-green-500'
                            : rating === 3
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm text-gray-600">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Write Review Dialog */}
      {canReview && orderId && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('writeReview')}</DialogTitle>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              orderId={orderId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
