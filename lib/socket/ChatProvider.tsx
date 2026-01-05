'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode
} from 'react'
import { useSocket } from './useSocket'
import type { Conversation, ChatMessage, Group } from './types'

interface ChatContextValue {
  // Connection state
  isConnected: boolean
  connectionError: string | null

  // Conversations
  conversations: Conversation[]
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void

  // Unread counts
  totalUnreadCount: number
  getUnreadCount: (conversationId: string) => number

  // Actions
  refreshConversations: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { socket, connected, error: connectionError } = useSocket()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map())

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !connected) return

    const handleNewMessage = (message: ChatMessage) => {
      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt
            }
          }
          return conv
        }).sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      )

      // Increment unread count if not active conversation
      if (message.conversationId !== activeConversationId) {
        setUnreadCounts(prev => {
          const next = new Map(prev)
          const current = next.get(message.conversationId) || 0
          next.set(message.conversationId, current + 1)
          return next
        })
      }
    }

    const handleGroupCreated = (group: Group & { conversation: Conversation }) => {
      // Add new group conversation
      const newConversation: Conversation = {
        ...group.conversation,
        group
      }
      setConversations(prev => [newConversation, ...prev])
    }

    const handleGroupUpdated = (group: Group) => {
      setConversations(prev =>
        prev.map(conv => {
          if (conv.group?.id === group.id) {
            return { ...conv, group }
          }
          return conv
        })
      )
    }

    socket.on('message:new', handleNewMessage)
    socket.on('group:created', handleGroupCreated)
    socket.on('group:updated', handleGroupUpdated)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('group:created', handleGroupCreated)
      socket.off('group:updated', handleGroupUpdated)
    }
  }, [socket, connected, activeConversationId])

  // Clear unread count when conversation becomes active
  useEffect(() => {
    if (activeConversationId) {
      setUnreadCounts(prev => {
        const next = new Map(prev)
        next.delete(activeConversationId)
        return next
      })
    }
  }, [activeConversationId])

  const refreshConversations = useCallback(() => {
    // This will be called by the parent to refresh from server
    // The actual fetching should be done via server actions
  }, [])

  const getUnreadCount = useCallback((conversationId: string) => {
    return unreadCounts.get(conversationId) || 0
  }, [unreadCounts])

  const totalUnreadCount = Array.from(unreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  )

  const value: ChatContextValue = {
    isConnected: connected,
    connectionError,
    conversations,
    activeConversationId,
    setActiveConversationId,
    totalUnreadCount,
    getUnreadCount,
    refreshConversations
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

// Safe version that returns null if not within ChatProvider
export function useChatContextSafe() {
  return useContext(ChatContext)
}
