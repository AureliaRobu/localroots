'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OnlineIndicator } from './OnlineIndicator'
import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/lib/socket/types'

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isActive?: boolean
  isOnline?: boolean
  unreadCount?: number
  onClick?: () => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive = false,
  isOnline = false,
  unreadCount = 0,
  onClick
}: ConversationItemProps) {
  // Get the other participant for direct messages
  const otherParticipant = conversation.type === 'DIRECT'
    ? conversation.participants.find(p => p.userId !== currentUserId)?.user
    : null

  // Get display name and image
  const displayName = conversation.type === 'GROUP'
    ? conversation.group?.name || 'Group'
    : otherParticipant?.name || 'Unknown'

  const displayImage = conversation.type === 'GROUP'
    ? conversation.group?.imageUrl
    : otherParticipant?.image

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Format last message preview
  const lastMessage = conversation.lastMessage || conversation.messages?.[0]
  const lastMessagePreview = lastMessage
    ? lastMessage.type === 'SYSTEM'
      ? lastMessage.content
      : lastMessage.senderId === currentUserId
        ? `You: ${lastMessage.content}`
        : lastMessage.content
    : 'No messages yet'

  const lastMessageTime = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
    : ''

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        'hover:bg-muted/50',
        isActive && 'bg-muted'
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={displayImage || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {conversation.type === 'DIRECT' && (
          <OnlineIndicator
            online={isOnline}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background rounded-full"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'font-medium truncate',
            unreadCount > 0 && 'font-semibold'
          )}>
            {displayName}
          </span>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground shrink-0">
              {lastMessageTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-sm truncate',
            unreadCount > 0
              ? 'text-foreground font-medium'
              : 'text-muted-foreground'
          )}>
            {lastMessagePreview}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
