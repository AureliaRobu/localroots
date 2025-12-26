'use client'

import { cn } from '@/lib/utils'
import { useChat } from '@/lib/socket/useChat'
import { useTyping } from '@/lib/socket/useTyping'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '@/lib/socket/types'

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  initialMessages?: ChatMessage[]
  participantNames?: Map<string, string>
  className?: string
  header?: React.ReactNode
}

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages = [],
  participantNames = new Map(),
  className,
  header
}: ChatWindowProps) {
  const {
    messages,
    sendMessage,
    isJoined,
    isLoading,
    error
  } = useChat({ conversationId, initialMessages })

  const {
    typingUsers,
    startTyping,
    stopTyping
  } = useTyping({ conversationId })

  if (error) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Failed to load chat</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !isJoined) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {header}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {header}

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        userNames={participantNames}
        className="flex-1"
      />

      <MessageInput
        onSend={sendMessage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        placeholder="Type a message..."
      />
    </div>
  )
}
