'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import type { ChatMessage, SendMessagePayload, ReadReceipt } from './types'

interface UseChatOptions {
  conversationId: string
  initialMessages?: ChatMessage[]
}

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string, type?: 'TEXT' | 'IMAGE' | 'FILE', attachmentUrl?: string) => void
  markAsRead: (messageId: string) => void
  isJoined: boolean
  isLoading: boolean
  error: string | null
}

export function useChat({ conversationId, initialMessages = [] }: UseChatOptions): UseChatReturn {
  const { socket, connected } = useSocket()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const joinedRef = useRef(false)

  // Join conversation when socket connects
  useEffect(() => {
    if (!socket || !connected || !conversationId) return

    // Prevent duplicate joins
    if (joinedRef.current) return

    const handleJoined = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setIsJoined(true)
        setIsLoading(false)
        joinedRef.current = true
      }
    }

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }

    const handleReadReceipt = (data: ReadReceipt) => {
      // Could update UI to show read status
      console.log('Message read:', data)
    }

    const handleError = (err: { message: string }) => {
      setError(err.message)
      setIsLoading(false)
    }

    socket.on('joined:conversation', handleJoined)
    socket.on('message:new', handleNewMessage)
    socket.on('message:read', handleReadReceipt)
    socket.on('error', handleError)

    // Join the conversation
    socket.emit('join:conversation', conversationId)

    return () => {
      socket.off('joined:conversation', handleJoined)
      socket.off('message:new', handleNewMessage)
      socket.off('message:read', handleReadReceipt)
      socket.off('error', handleError)

      // Leave conversation on cleanup
      if (joinedRef.current) {
        socket.emit('leave:conversation', conversationId)
        joinedRef.current = false
      }
    }
  }, [socket, connected, conversationId])

  // Reset when conversation changes
  useEffect(() => {
    setMessages(initialMessages)
    setIsJoined(false)
    setIsLoading(true)
    setError(null)
    joinedRef.current = false
  }, [conversationId])

  const sendMessage = useCallback((
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
    attachmentUrl?: string
  ) => {
    if (!socket || !isJoined || !content.trim()) return

    const payload: SendMessagePayload = {
      conversationId,
      content: content.trim(),
      type,
      attachmentUrl
    }

    socket.emit('message:send', payload)
  }, [socket, isJoined, conversationId])

  const markAsRead = useCallback((messageId: string) => {
    if (!socket || !isJoined) return

    socket.emit('message:read', {
      conversationId,
      messageId
    })
  }, [socket, isJoined, conversationId])

  return {
    messages,
    sendMessage,
    markAsRead,
    isJoined,
    isLoading,
    error
  }
}
