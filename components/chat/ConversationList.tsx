'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConversationItem } from './ConversationItem'
import { useChatContext } from '@/lib/socket'
import { usePresence } from '@/lib/socket/usePresence'
import { getUserConversations } from '@/lib/actions/chat'
import { MessageSquarePlus, Search, Users } from 'lucide-react'
import type { Conversation } from '@/lib/socket/types'

interface ConversationListProps {
  currentUserId: string
  className?: string
}

export function ConversationList({ currentUserId, className }: ConversationListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { getUnreadCount } = useChatContext()
  const { onlineUsers } = usePresence()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Extract active conversation ID from pathname
  const activeConversationId = pathname.includes('/messages/')
    ? pathname.split('/messages/')[1]?.split('/')[0]
    : null

  useEffect(() => {
    const loadConversations = async () => {
      const result = await getUserConversations()
      if (result.success) {
        setConversations(result.data as unknown as Conversation[])
      }
      setIsLoading(false)
    }
    loadConversations()
  }, [])

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()

    if (conv.type === 'GROUP') {
      return conv.group?.name.toLowerCase().includes(searchLower)
    }

    const otherParticipant = conv.participants.find(p => p.userId !== currentUserId)
    return otherParticipant?.user.name?.toLowerCase().includes(searchLower)
  })

  const handleConversationClick = (conversationId: string) => {
    router.push(`/${locale}/messages/${conversationId}`)
  }

  const isUserOnline = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') return false
    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId)
    return otherParticipant ? onlineUsers.has(otherParticipant.userId) : false
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/${locale}/messages/new`)}
            title="New message"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/${locale}/messages`)}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/${locale}/messages/groups`)}
          >
            <Users className="h-4 w-4 mr-1" />
            Groups
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? (
              <p>No conversations found</p>
            ) : (
              <>
                <p className="mb-2">No conversations yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${locale}/messages/new`)}
                >
                  Start a conversation
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={activeConversationId === conversation.id}
                isOnline={isUserOnline(conversation)}
                unreadCount={getUnreadCount(conversation.id)}
                onClick={() => handleConversationClick(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
