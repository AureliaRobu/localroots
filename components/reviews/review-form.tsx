'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { reviewSchema, updateReviewSchema } from '@/lib/validations/review'
import type { ReviewFormData, UpdateReviewFormData } from '@/lib/validations/review'
import { createReview, updateReview } from '@/lib/actions/review'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from './star-rating'
import { toast } from 'sonner'
import type { ReviewWithUser } from '@/types'

interface ReviewFormProps {
  productId: string
  orderId: string
  existingReview?: ReviewWithUser
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({
  productId,
  orderId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const t = useTranslations('reviews')
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isUpdate = !!existingReview

  const form = useForm<ReviewFormData | UpdateReviewFormData>({
    resolver: zodResolver(isUpdate ? updateReviewSchema : reviewSchema),
    defaultValues: isUpdate
      ? {
          reviewId: existingReview.id,
          title: existingReview.title,
          comment: existingReview.comment || '',
          rating: existingReview.rating,
        }
      : {
          productId,
          orderId,
          title: '',
          comment: '',
          rating: 0,
        },
  })

  const { register, handleSubmit, setValue, formState: { errors } } = form

  // Update form value when rating changes
  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    setValue('rating', newRating)
  }

  const onSubmit = async (data: ReviewFormData | UpdateReviewFormData) => {
    if (rating === 0) {
      toast.error(t('ratingRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      const result = isUpdate
        ? await updateReview(data as UpdateReviewFormData)
        : await createReview(data as ReviewFormData)

      if (result.success) {
        toast.success(
          isUpdate ? t('updateSuccess') : t('createSuccess')
        )
        onSuccess?.()
      } else {
        toast.error(result.error || t('submitFailed'))
      }
    } catch (error) {
      toast.error(t('submitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Rating */}
      <div className="space-y-2">
        <Label>{t('rating')} *</Label>
        <StarRating
          rating={rating}
          variant="input"
          size="lg"
          onChange={handleRatingChange}
          className="mt-1"
        />
        <input type="hidden" {...register('rating')} value={rating} />
        {(rating === 0 || errors.rating) && (
          <p className="text-sm text-red-500">
            {errors.rating?.message || t('ratingRequired')}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('reviewTitle')} *</Label>
        <Input
          id="title"
          placeholder={t('titlePlaceholder')}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">{t('comment')}</Label>
        <Textarea
          id="comment"
          placeholder={t('commentPlaceholder')}
          rows={5}
          {...register('comment')}
        />
        {errors.comment && (
          <p className="text-sm text-red-500">{errors.comment.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
