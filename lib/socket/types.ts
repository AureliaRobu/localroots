// Socket event types for client-side use

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  attachmentUrl?: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

export interface Conversation {
  id: string
  type: 'DIRECT' | 'GROUP'
  createdAt: string
  updatedAt: string
  participants: ConversationParticipant[]
  messages?: ChatMessage[]
  group?: Group | null
  lastMessage?: ChatMessage | null
  unreadCount?: number
}

export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  joinedAt: string
  lastReadAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    role: string
  }
}

export interface Group {
  id: string
  conversationId: string
  name: string
  description?: string | null
  imageUrl?: string | null
  category: GroupCategory
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: string
    name: string | null
    image: string | null
  }
}

export type GroupCategory =
  | 'GENERAL'
  | 'FOOD_SHARE'
  | 'NEWS'
  | 'RECIPES'
  | 'TIPS'
  | 'LOCAL_EVENTS'

export interface TypingUser {
  userId: string
  conversationId: string
  timestamp: string
}

export interface PresenceStatus {
  userId: string
  online: boolean
}

export interface ReadReceipt {
  messageId: string
  userId: string
  readAt: string
}

// Socket event payloads
export interface SendMessagePayload {
  conversationId: string
  content: string
  type?: 'TEXT' | 'IMAGE' | 'FILE'
  attachmentUrl?: string
}

export interface CreateGroupPayload {
  name: string
  description?: string
  category: GroupCategory
  memberIds: string[]
  imageUrl?: string
}
