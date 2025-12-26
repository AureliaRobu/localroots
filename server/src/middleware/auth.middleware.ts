import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface SocketData {
  userId: string;
  role: string;
  email?: string;
}

interface TokenPayload {
  sub: string;      // User ID
  role: string;     // User role (FARMER, CUSTOMER, ADMIN)
  email?: string;   // User email
  iat?: number;     // Issued at
  exp?: number;     // Expiration
}

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log('Socket auth failed: No token provided');
      return next(new Error('Authentication token required'));
    }

    if (!process.env.AUTH_SECRET) {
      console.error('Socket auth failed: AUTH_SECRET not configured');
      return next(new Error('Server configuration error'));
    }

    // Verify JWT (same secret as NextAuth)
    const decoded = jwt.verify(token, process.env.AUTH_SECRET) as TokenPayload;

    if (!decoded.sub) {
      console.log('Socket auth failed: Invalid token payload');
      return next(new Error('Invalid token payload'));
    }

    // Attach user data to socket
    socket.data.userId = decoded.sub;
    socket.data.role = decoded.role;
    socket.data.email = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Socket auth failed: Token expired');
      return next(new Error('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Socket auth failed: Invalid token');
      return next(new Error('Invalid authentication token'));
    }
    console.error('Socket auth failed:', error);
    next(new Error('Authentication failed'));
  }
}
