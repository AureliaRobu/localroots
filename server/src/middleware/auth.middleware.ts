import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface SocketData {
  userId: string;
  role: string;
}

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT (same secret as NextAuth)
    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET!
    ) as { sub: string; role: string };

    // Attach user data to socket
    socket.data.userId = decoded.sub;
    socket.data.role = decoded.role;

    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
}
