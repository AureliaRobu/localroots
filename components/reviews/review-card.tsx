'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Edit, Trash2, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StarRating } from './star-rating'
import { deleteReview } from '@/lib/actions/review'
import { toast } from 'sonner'
import type { ReviewWithUser } from '@/types'

interface ReviewCardProps {
  review: ReviewWithUser
  currentUserId?: string
  onEdit?: (review: ReviewWithUser) => void
}

export function ReviewCard({ review, currentUserId, onEdit }: ReviewCardProps) {
  const t = useTranslations('reviews')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === review.userId

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReview(review.id)
      if (result.success) {
        toast.success(t('deleteSuccess'))
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error || t('deleteFailed'))
      }
    } catch (error) {
      toast.error(t('deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="border-b pb-6 last:border-b-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{review.user.name || 'Anonymous'}</p>
                {review.isVerified && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <BadgeCheck className="h-4 w-4" />
                    <span>{t('verifiedPurchase')}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {isOwner && onEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(review)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('editReview')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteReview')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <h4 className="font-semibold">{review.title}</h4>
          {review.comment && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteReview')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
