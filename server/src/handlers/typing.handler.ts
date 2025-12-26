import { Server, Socket } from 'socket.io';

// Track typing timeouts to auto-stop typing after inactivity
const typingTimeouts = new Map<string, NodeJS.Timeout>();

export function registerTypingHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Start typing indicator
  socket.on('typing:start', (conversationId: string) => {
    const key = `${userId}:${conversationId}`;

    // Clear existing timeout if any
    const existingTimeout = typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Broadcast typing start to other participants
    socket.to(`conversation:${conversationId}`).emit('typing:user_start', {
      userId,
      conversationId,
      timestamp: new Date().toISOString()
    });

    // Auto-stop typing after 5 seconds of no activity
    const timeout = setTimeout(() => {
      socket.to(`conversation:${conversationId}`).emit('typing:user_stop', {
        userId,
        conversationId,
        timestamp: new Date().toISOString()
      });
      typingTimeouts.delete(key);
    }, 5000);

    typingTimeouts.set(key, timeout);
  });

  // Stop typing indicator
  socket.on('typing:stop', (conversationId: string) => {
    const key = `${userId}:${conversationId}`;

    // Clear timeout
    const existingTimeout = typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeouts.delete(key);
    }

    // Broadcast typing stop
    socket.to(`conversation:${conversationId}`).emit('typing:user_stop', {
      userId,
      conversationId,
      timestamp: new Date().toISOString()
    });
  });

  // Clean up timeouts on disconnect
  socket.on('disconnect', () => {
    // Find and clear all typing timeouts for this user
    for (const [key, timeout] of typingTimeouts.entries()) {
      if (key.startsWith(`${userId}:`)) {
        clearTimeout(timeout);
        typingTimeouts.delete(key);

        // Extract conversationId from key
        const conversationId = key.split(':')[1];
        socket.to(`conversation:${conversationId}`).emit('typing:user_stop', {
          userId,
          conversationId,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
}
