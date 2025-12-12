'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  variant?: 'display' | 'input'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  variant = 'display',
  size = 'md',
  onChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const stars = [1, 2, 3, 4, 5]

  const handleClick = (starRating: number) => {
    if (variant === 'input' && onChange) {
      onChange(starRating)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stars.map((star) => {
        const isFilled = star <= rating
        const isPartial = star === Math.ceil(rating) && rating % 1 !== 0

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={variant === 'display'}
            className={cn(
              'relative transition-colors',
              variant === 'input' && 'cursor-pointer hover:scale-110',
              variant === 'display' && 'cursor-default'
            )}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            {isPartial ? (
              <div className="relative">
                <Star className={cn(sizeClasses[size], 'text-gray-300')} />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating % 1) * 100}%` }}
                >
                  <Star
                    className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')}
                  />
                </div>
              </div>
            ) : (
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : variant === 'input'
                    ? 'text-gray-300 hover:text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
