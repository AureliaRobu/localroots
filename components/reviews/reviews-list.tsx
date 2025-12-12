'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ReviewCard } from './review-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReviewForm } from './review-form'
import { getProductReviews } from '@/lib/actions/review'
import type { ReviewWithUser } from '@/types'

interface ReviewsListProps {
  initialReviews: ReviewWithUser[]
  productId: string
  orderId?: string
  currentUserId?: string
  totalCount: number
}

export function ReviewsList({
  initialReviews,
  productId,
  orderId,
  currentUserId,
  totalCount,
}: ReviewsListProps) {
  const t = useTranslations('reviews')
  const [reviews, setReviews] = useState(initialReviews)
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(totalCount > initialReviews.length)
  const [editingReview, setEditingReview] = useState<ReviewWithUser | null>(null)

  const handleSortChange = async (newSort: 'recent' | 'highest' | 'lowest') => {
    setSortBy(newSort)
    const result = await getProductReviews(productId, { sortBy: newSort })
    if (result.success && result.data) {
      setReviews(result.data.reviews)
      setHasMore(result.data.hasMore)
    }
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const result = await getProductReviews(productId, {
      offset: reviews.length,
      sortBy,
    })
    if (result.success && result.data) {
      setReviews([...reviews, ...result.data.reviews])
      setHasMore(result.data.hasMore)
    }
    setIsLoadingMore(false)
  }

  const handleEditSuccess = async () => {
    setEditingReview(null)
    // Refresh reviews
    const result = await getProductReviews(productId, { sortBy })
    if (result.success && result.data) {
      setReviews(result.data.reviews)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{t('noReviews')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Sort Dropdown */}
        <div className="flex justify-end">
          <Select value={sortBy} onValueChange={(value: any) => handleSortChange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('sortRecent')}</SelectItem>
              <SelectItem value="highest">{t('sortHighest')}</SelectItem>
              <SelectItem value="lowest">{t('sortLowest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={setEditingReview}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? t('loading') : t('loadMore')}
            </Button>
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      {editingReview && orderId && (
        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editReview')}</DialogTitle>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              orderId={orderId}
              existingReview={editingReview}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingReview(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
