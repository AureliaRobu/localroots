'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { OnlineIndicator } from '@/components/chat/OnlineIndicator'
import { useChatContext, usePresence } from '@/lib/socket'
import { ArrowLeft, Users } from 'lucide-react'
import type { ChatMessage } from '@/lib/socket/types'

interface ChatPageClientProps {
  conversationId: string
  currentUserId: string
  initialMessages: Array<{
    id: string
    conversationId: string
    senderId: string
    content: string
    type: string
    attachmentUrl: string | null
    createdAt: Date
    sender: { id: string; name: string | null; image: string | null }
  }>
  participantNames: Record<string, string>
  headerInfo: {
    name: string
    image?: string | null
    role?: string
    isGroup: boolean
    participantCount: number
  }
  locale: string
}

export function ChatPageClient({
  conversationId,
  currentUserId,
  initialMessages,
  participantNames,
  headerInfo,
  locale
}: ChatPageClientProps) {
  const router = useRouter()
  const { setActiveConversationId } = useChatContext()
  const { onlineUsers } = usePresence()

  // Set active conversation for unread tracking
  useEffect(() => {
    setActiveConversationId(conversationId)
    return () => setActiveConversationId(null)
  }, [conversationId, setActiveConversationId])

  // Convert initial messages to ChatMessage format
  const formattedMessages: ChatMessage[] = initialMessages.map(msg => ({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    content: msg.content,
    type: msg.type as 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM',
    attachmentUrl: msg.attachmentUrl || undefined,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.createdAt.toISOString(),
    sender: {
      id: msg.sender.id,
      name: msg.sender.name,
      image: msg.sender.image
    }
  }))

  // Check if other user is online (for direct messages)
  const isOtherUserOnline = !headerInfo.isGroup &&
    Object.keys(participantNames).some(
      userId => userId !== currentUserId && onlineUsers.has(userId)
    )

  const initials = headerInfo.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const header = (
    <div className="flex items-center gap-3 p-4 border-b bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => router.push(`/${locale}/messages`)}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={headerInfo.image || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!headerInfo.isGroup && (
          <OnlineIndicator
            online={isOtherUserOnline}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="font-medium truncate">{headerInfo.name}</h1>
        <p className="text-xs text-muted-foreground">
          {headerInfo.isGroup ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {headerInfo.participantCount} members
            </span>
          ) : (
            <>
              {isOtherUserOnline ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span>Offline</span>
              )}
              {headerInfo.role && ` - ${headerInfo.role}`}
            </>
          )}
        </p>
      </div>
    </div>
  )

  return (
    <ChatWindow
      conversationId={conversationId}
      currentUserId={currentUserId}
      initialMessages={formattedMessages}
      participantNames={new Map(Object.entries(participantNames))}
      header={header}
      className="h-full"
    />
  )
}
