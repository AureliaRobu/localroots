'use client'

import { cn } from '@/lib/utils'

interface OnlineIndicatorProps {
  online: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

export function OnlineIndicator({
  online,
  size = 'md',
  className,
  showLabel = false
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'rounded-full',
          sizeClasses[size],
          online ? 'bg-green-500' : 'bg-gray-400'
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {online ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}
