import * as z from 'zod'

const commentValidation = z
  .string()
  .transform((val) => val || '')
  .refine((val) => val.length === 0 || val.length >= 10, {
    message: 'Comment must be at least 10 characters or left empty'
  })

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  comment: commentValidation,
  productId: z.string().cuid(),
  orderId: z.string().cuid()
})

export const updateReviewSchema = z.object({
  reviewId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  comment: commentValidation
})

export type ReviewFormData = z.infer<typeof reviewSchema>
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>
