'use client'

import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  userNames: string[]
  className?: string
}

export function TypingIndicator({ userNames, className }: TypingIndicatorProps) {
  if (userNames.length === 0) return null

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing`
    }
    if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing`
    }
    return `${userNames[0]} and ${userNames.length - 1} others are typing`
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
          •
        </span>
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}
