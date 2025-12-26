'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import type { TypingUser } from './types'

interface UseTypingOptions {
  conversationId: string
  debounceMs?: number
}

interface UseTypingReturn {
  typingUsers: TypingUser[]
  startTyping: () => void
  stopTyping: () => void
  isTyping: boolean
}

export function useTyping({
  conversationId,
  debounceMs = 1000
}: UseTypingOptions): UseTypingReturn {
  const { socket, connected } = useSocket()
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!socket || !connected) return

    const handleTypingStart = (data: TypingUser) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => {
          // Update or add typing user
          const existing = prev.find(u => u.userId === data.userId)
          if (existing) {
            return prev.map(u =>
              u.userId === data.userId ? { ...u, timestamp: data.timestamp } : u
            )
          }
          return [...prev, data]
        })
      }
    }

    const handleTypingStop = (data: TypingUser) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
      }
    }

    socket.on('typing:user_start', handleTypingStart)
    socket.on('typing:user_stop', handleTypingStop)

    return () => {
      socket.off('typing:user_start', handleTypingStart)
      socket.off('typing:user_stop', handleTypingStop)
    }
  }, [socket, connected, conversationId])

  // Clean up stale typing indicators (older than 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev =>
        prev.filter(u => now - new Date(u.timestamp).getTime() < 6000)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Reset when conversation changes
  useEffect(() => {
    setTypingUsers([])
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [conversationId])

  const startTyping = useCallback(() => {
    if (!socket || !connected) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Only emit if not already typing
    if (!isTyping) {
      socket.emit('typing:start', conversationId)
      setIsTyping(true)
    }

    // Auto-stop after debounce period
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', conversationId)
      setIsTyping(false)
    }, debounceMs)
  }, [socket, connected, conversationId, isTyping, debounceMs])

  const stopTyping = useCallback(() => {
    if (!socket || !connected) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      socket.emit('typing:stop', conversationId)
      setIsTyping(false)
    }
  }, [socket, connected, conversationId, isTyping])

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping
  }
}
