import { Server, Socket } from 'socket.io';
import { redis } from '../utils/redis';

const ONLINE_USERS_KEY = 'online_users';
const USER_SOCKET_MAP_KEY = 'user_socket_map';

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // User comes online (called on connection or explicitly)
  const handleOnline = async () => {
    try {
      // Add user to online set
      await redis.sAdd(ONLINE_USERS_KEY, userId);

      // Map socket ID to user ID for tracking
      await redis.hSet(USER_SOCKET_MAP_KEY, socket.id, userId);

      // Broadcast to all connected users
      io.emit('presence:user_online', {
        userId,
        timestamp: new Date().toISOString()
      });

      console.log(`User ${userId} is now online`);
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  };

  // User goes offline
  const handleOffline = async () => {
    try {
      // Check if user has other active sockets before marking offline
      const allSockets = await io.fetchSockets();
      const userSockets = allSockets.filter(s => s.data.userId === userId && s.id !== socket.id);

      if (userSockets.length === 0) {
        // No other sockets, mark as offline
        await redis.sRem(ONLINE_USERS_KEY, userId);

        io.emit('presence:user_offline', {
          userId,
          timestamp: new Date().toISOString()
        });

        console.log(`User ${userId} is now offline`);
      }

      // Remove this socket from the map
      await redis.hDel(USER_SOCKET_MAP_KEY, socket.id);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  };

  // Mark user as online on connection
  handleOnline();

  // Listen for explicit online/offline events
  socket.on('presence:online', handleOnline);
  socket.on('presence:offline', handleOffline);

  // Handle disconnect
  socket.on('disconnect', handleOffline);

  // Check online status of multiple users
  socket.on('presence:check', async (userIds: string[]) => {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        socket.emit('presence:status', []);
        return;
      }

      // Check which users are online
      const onlineStatuses = await Promise.all(
        userIds.map(async (id) => ({
          userId: id,
          online: await redis.sIsMember(ONLINE_USERS_KEY, id)
        }))
      );

      socket.emit('presence:status', onlineStatuses);
    } catch (error) {
      console.error('Error checking presence:', error);
      socket.emit('error', { message: 'Failed to check presence' });
    }
  });

  // Get all online users
  socket.on('presence:get_all_online', async () => {
    try {
      const onlineUsers = await redis.sMembers(ONLINE_USERS_KEY);
      socket.emit('presence:all_online', { users: onlineUsers });
    } catch (error) {
      console.error('Error getting online users:', error);
      socket.emit('error', { message: 'Failed to get online users' });
    }
  });
}
