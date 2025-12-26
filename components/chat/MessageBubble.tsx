'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import type { ChatMessage } from '@/lib/socket/types'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true
}: MessageBubbleProps) {
  const initials = message.sender.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?'

  if (message.type === 'SYSTEM') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.sender.image || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.name}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          {message.type === 'IMAGE' && message.attachmentUrl && (
            <img
              src={message.attachmentUrl}
              alt="Shared image"
              className="max-w-xs rounded-lg mb-2"
            />
          )}

          {message.type === 'FILE' && message.attachmentUrl && (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline mb-2"
            >
              📎 Attachment
            </a>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {showTimestamp && (
          <span className="text-[10px] text-muted-foreground mt-1">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
        )}
      </div>
    </div>
  )
}
