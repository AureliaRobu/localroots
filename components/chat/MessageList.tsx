'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { ChatMessage, TypingUser } from '@/lib/socket/types'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  typingUsers?: TypingUser[]
  userNames?: Map<string, string>
  className?: string
  onMessageVisible?: (messageId: string) => void
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers = [],
  userNames = new Map(),
  className,
  onMessageVisible
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Get typing user names
  const typingUserNames = typingUsers
    .filter(u => u.userId !== currentUserId)
    .map(u => userNames.get(u.userId) || 'Someone')

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, ChatMessage[]>)

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-4',
        className
      )}
    >
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="space-y-3">
            {msgs.map((message, index) => {
              const isOwn = message.senderId === currentUserId
              const prevMessage = msgs[index - 1]
              const showAvatar =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                prevMessage.type === 'SYSTEM'

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              )
            })}
          </div>
        </div>
      ))}

      {typingUserNames.length > 0 && (
        <TypingIndicator userNames={typingUserNames} className="px-2" />
      )}

      <div ref={bottomRef} />
    </div>
  )
}
