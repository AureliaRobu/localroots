'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReviewForm } from './review-form'
import { canReviewProduct } from '@/lib/actions/review'
import { CheckCircle } from 'lucide-react'

interface ReviewButtonProps {
  productId: string
  productName: string
  orderId: string
  orderStatus: string
}

export function ReviewButton({ productId, productName, orderId, orderStatus }: ReviewButtonProps) {
  const t = useTranslations('reviews')
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (orderStatus === 'COMPLETED') {
      checkReviewEligibility()
    } else {
      setIsChecking(false)
    }
  }, [productId, orderStatus])

  const checkReviewEligibility = async () => {
    const result = await canReviewProduct(productId)
    if (result.success && result.data) {
      setCanReview(result.data.canReview)
      setHasReviewed(result.data.reason === 'Already reviewed')
    }
    setIsChecking(false)
  }

  const handleReviewSuccess = () => {
    setShowReviewDialog(false)
    setHasReviewed(true)
    setCanReview(false)
  }

  // Don't show button if order is not completed
  if (orderStatus !== 'COMPLETED' || isChecking) {
    return null
  }

  // Show "Reviewed" badge if already reviewed
  if (hasReviewed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Reviewed</span>
      </div>
    )
  }

  // Show review button if eligible
  if (canReview) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReviewDialog(true)}
        >
          {t('leaveReview')}
        </Button>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t('writeReview')} - {productName}
              </DialogTitle>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              orderId={orderId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return null
}
