import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { authMiddleware } from './middleware/auth.middleware';
import { connectRedis } from './utils/redis';
import {
  registerChatHandlers,
  registerPresenceHandlers,
  registerTypingHandlers,
  registerGroupHandlers
} from './handlers';

// Railway injects PORT, fallback to SOCKET_PORT for local dev
const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001;

export async function createSocketServer() {
  // Connect the main Redis client used by handlers
  await connectRedis();
  console.log('Redis client connected');

  // Redis clients for adapter (pub/sub pattern)
  const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();

  await Promise.all([
    pubClient.connect(),
    subClient.connect()
  ]);

  console.log('Redis Pub/Sub clients connected');

  // Socket.io server
  const io = new Server({
    cors: {
        origin: [
            'https://localroots.earth',
            'https://www.localroots.earth',
            'http://localhost:3000'  // Keep for local dev
        ],
      credentials: true
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Authentication middleware
  io.use(authMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId} (${socket.data.role})`);

    // Register event handlers
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerGroupHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  io.listen(Number(PORT));
  console.log(`Socket.io server listening on port ${PORT}`);

  return io;
}
