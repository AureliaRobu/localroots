import { io, Socket } from 'socket.io-client'
import { getSession } from 'next-auth/react'

let socket: Socket | null = null

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket
  }

  const session = await getSession()

  if (!session?.user || !session.accessToken) {
    throw new Error('User not authenticated')
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: session.accessToken
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  return socket
}

export function getSocketSync(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
