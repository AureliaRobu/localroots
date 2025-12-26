'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSocket } from './useSocket'
import type { PresenceStatus } from './types'

interface UsePresenceOptions {
  userIds?: string[]
  pollInterval?: number
}

interface UsePresenceReturn {
  onlineUsers: Set<string>
  isUserOnline: (userId: string) => boolean
  checkPresence: (userIds: string[]) => void
  allOnlineUsers: string[]
}

export function usePresence({
  userIds = [],
  pollInterval = 30000
}: UsePresenceOptions = {}): UsePresenceReturn {
  const { socket, connected } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [allOnlineUsers, setAllOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    if (!socket || !connected) return

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]))
      setAllOnlineUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId]
        }
        return prev
      })
    }

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
      setAllOnlineUsers(prev => prev.filter(id => id !== data.userId))
    }

    const handlePresenceStatus = (statuses: PresenceStatus[]) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        statuses.forEach(s => {
          if (s.online) {
            next.add(s.userId)
          } else {
            next.delete(s.userId)
          }
        })
        return next
      })
    }

    const handleAllOnline = (data: { users: string[] }) => {
      setAllOnlineUsers(data.users)
      setOnlineUsers(new Set(data.users))
    }

    socket.on('presence:user_online', handleUserOnline)
    socket.on('presence:user_offline', handleUserOffline)
    socket.on('presence:status', handlePresenceStatus)
    socket.on('presence:all_online', handleAllOnline)

    // Initial check for provided userIds
    if (userIds.length > 0) {
      socket.emit('presence:check', userIds)
    }

    // Get all online users
    socket.emit('presence:get_all_online')

    return () => {
      socket.off('presence:user_online', handleUserOnline)
      socket.off('presence:user_offline', handleUserOffline)
      socket.off('presence:status', handlePresenceStatus)
      socket.off('presence:all_online', handleAllOnline)
    }
  }, [socket, connected, userIds.join(',')])

  // Poll for presence updates
  useEffect(() => {
    if (!socket || !connected || userIds.length === 0) return

    const interval = setInterval(() => {
      socket.emit('presence:check', userIds)
    }, pollInterval)

    return () => clearInterval(interval)
  }, [socket, connected, userIds.join(','), pollInterval])

  const checkPresence = useCallback((ids: string[]) => {
    if (!socket || !connected || ids.length === 0) return
    socket.emit('presence:check', ids)
  }, [socket, connected])

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId)
  }, [onlineUsers])

  return {
    onlineUsers,
    isUserOnline,
    checkPresence,
    allOnlineUsers
  }
}
