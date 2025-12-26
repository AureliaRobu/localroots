'use client'

import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket } from './client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initSocket = async () => {
      try {
        const s = await getSocket()

        if (!mounted) return

        setSocket(s)
        setConnected(s.connected)
        setError(null)

        const handleConnect = () => {
          if (mounted) setConnected(true)
        }

        const handleDisconnect = () => {
          if (mounted) setConnected(false)
        }

        const handleError = (err: Error) => {
          if (mounted) setError(err.message)
        }

        s.on('connect', handleConnect)
        s.on('disconnect', handleDisconnect)
        s.on('connect_error', handleError)

        return () => {
          s.off('connect', handleConnect)
          s.off('disconnect', handleDisconnect)
          s.off('connect_error', handleError)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect')
        }
      }
    }

    initSocket()

    return () => {
      mounted = false
    }
  }, [])

  const disconnect = useCallback(() => {
    disconnectSocket()
    setSocket(null)
    setConnected(false)
  }, [])

  return { socket, connected, error, disconnect }
}
