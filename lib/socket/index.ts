// Client and connection
export { getSocket, getSocketSync, disconnectSocket } from './client'

// Hooks
export { useSocket } from './useSocket'
export { useChat } from './useChat'
export { useTyping } from './useTyping'
export { usePresence } from './usePresence'

// Context
export { ChatProvider, useChatContext } from './ChatProvider'

// Types
export type {
  ChatMessage,
  Conversation,
  ConversationParticipant,
  Group,
  GroupCategory,
  TypingUser,
  PresenceStatus,
  ReadReceipt,
  SendMessagePayload,
  CreateGroupPayload
} from './types'
