'use client'

import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { ChatProvider } from '@/lib/socket'
import { ReactNode } from 'react'

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        setAuthState(session?.user ? 'authenticated' : 'unauthenticated')
      } catch {
        setAuthState('unauthenticated')
      }
    }
    checkAuth()
  }, [])

  // Always wrap with ChatProvider for dashboard routes
  // The ChatProvider will handle connection gracefully if not authenticated
  // This prevents the "must be used within ChatProvider" error
  if (authState === 'loading') {
    // Wrap with ChatProvider even during loading to prevent context errors
    return <ChatProvider>{children}</ChatProvider>
  }

  if (authState === 'unauthenticated') {
    return <>{children}</>
  }

  return <ChatProvider>{children}</ChatProvider>
}
