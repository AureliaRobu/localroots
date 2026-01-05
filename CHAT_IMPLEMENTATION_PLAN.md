# Real-Time Chat Implementation Plan
## Socket.io + Redis Architecture

**Project**: LocalRoots Chat & Food Communities
**Tech Stack**: Socket.io, Redis, PostgreSQL/Prisma, Next.js 15
**Target**: Bidirectional chat between farmers/customers + group communities

---

## Phase 1: Database Schema (Prisma)

### New Models

```prisma
model Conversation {
  id            String    @id @default(cuid())
  type          ConversationType @default(DIRECT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  participants  ConversationParticipant[]
  messages      Message[]
  group         Group?

  @@index([type])
}

enum ConversationType {
  DIRECT      // 1-on-1 chat
  GROUP       // Group/community chat
}

model ConversationParticipant {
  id              String   @id @default(cuid())
  conversationId  String
  userId          String
  joinedAt        DateTime @default(now())
  lastReadAt      DateTime @default(now())

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  senderId        String
  content         String   @db.Text
  type            MessageType @default(TEXT)
  attachmentUrl   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User @relation(fields: [senderId], references: [id], onDelete: Cascade)
  readReceipts    MessageReadReceipt[]

  @@index([conversationId, createdAt])
  @@index([senderId])
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM  // Join/leave notifications
}

model MessageReadReceipt {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  readAt    DateTime @default(now())

  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
}

model Group {
  id              String   @id @default(cuid())
  conversationId  String   @unique
  name            String
  description     String?  @db.Text
  imageUrl        String?
  category        GroupCategory @default(GENERAL)
  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  createdBy       User @relation(fields: [createdById], references: [id])

  @@index([category])
  @@index([createdById])
}

enum GroupCategory {
  GENERAL
  FOOD_SHARE      // Food sharing community
  NEWS            // News and updates
  RECIPES         // Recipe sharing
  TIPS            // Farming/cooking tips
  LOCAL_EVENTS    // Local events
}
```

### User Model Updates

Add relations to existing `User` model:

```prisma
model User {
  // ... existing fields

  // Chat relations
  conversationParticipants  ConversationParticipant[]
  messages                  Message[]
  messageReadReceipts       MessageReadReceipt[]
  createdGroups             Group[]
}
```

### Migration Command

```bash
npx prisma generate
npx prisma db push
```

---

## Phase 2: WebSocket Server Setup

### Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP Upgrade
         │
┌────────▼────────┐      ┌─────────────┐
│  Socket.io      │◄────►│    Redis    │
│  Server         │      │   Pub/Sub   │
│  (Port 3001)    │      └─────────────┘
└────────┬────────┘
         │
         │ WebSocket
         │
┌────────▼────────┐
│   Clients       │
│ (React/Next.js) │
└─────────────────┘
```

### Server Structure

Create `/server/` directory:

```
/server
  /src
    /handlers
      - chat.handler.ts          # Chat message events
      - presence.handler.ts      # User online/offline
      - typing.handler.ts        # Typing indicators
      - group.handler.ts         # Group events
    /middleware
      - auth.middleware.ts       # Socket authentication
      - error.middleware.ts      # Error handling
    /utils
      - redis.ts                 # Redis client setup
      - prisma.ts                # Prisma client
    - server.ts                  # Main Socket.io server
    - index.ts                   # Entry point
  - package.json
  - tsconfig.json
```

### Dependencies

```json
{
  "name": "localroots-chat-server",
  "dependencies": {
    "socket.io": "^4.7.2",
    "redis": "^4.6.12",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.x.x"
  },
  "devDependencies": {
    "@types/node": "^20.x.x",
    "typescript": "^5.x.x",
    "tsx": "^4.7.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Main Server (`/server/src/server.ts`)

```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { authMiddleware } from './middleware/auth.middleware';
import { registerChatHandlers } from './handlers/chat.handler';
import { registerPresenceHandlers } from './handlers/presence.handler';
import { registerTypingHandlers } from './handlers/typing.handler';
import { registerGroupHandlers } from './handlers/group.handler';

const PORT = process.env.SOCKET_PORT || 3001;

export async function createSocketServer() {
  // Redis clients for adapter
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([
    pubClient.connect(),
    subClient.connect()
  ]);

  // Socket.io server
  const io = new Server({
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Authentication middleware
  io.use(authMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Register event handlers
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerGroupHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}
```

---

## Phase 3: Authentication Middleware

### JWT Token Verification (`/server/src/middleware/auth.middleware.ts`)

```typescript
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
```

### Client-Side Token Passing

In Next.js app, extract session token and pass to Socket.io:

```typescript
// /lib/socket/client.ts
import { io, Socket } from 'socket.io-client';
import { getSession } from 'next-auth/react';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const session = await getSession();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  // Extract JWT token from session
  const token = session.accessToken; // Need to expose in session callback

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    auth: { token },
    autoConnect: true
  });

  return socket;
}
```

**NextAuth Configuration Update** (`/lib/auth/auth.ts`):

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
      token.id = user.id;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.accessToken = token; // Expose token for Socket.io
    }
    return session;
  }
}
```

---

## Phase 4: Event Handlers

### Chat Handler (`/server/src/handlers/chat.handler.ts`)

```typescript
import { Server, Socket } from 'socket.io';
import { prisma } from '../utils/prisma';

export function registerChatHandlers(io: Server, socket: Socket) {

  // Join conversation room
  socket.on('join:conversation', async (conversationId: string) => {
    const userId = socket.data.userId;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }

    socket.join(`conversation:${conversationId}`);
    socket.emit('joined:conversation', { conversationId });
  });

  // Send message
  socket.on('message:send', async (data: {
    conversationId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE';
  }) => {
    const userId = socket.data.userId;

    try {
      // Create message in database
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          type: data.type || 'TEXT'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      // Broadcast to conversation room
      io.to(`conversation:${data.conversationId}`).emit('message:new', message);

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('message:read', async (data: {
    conversationId: string;
    messageId: string;
  }) => {
    const userId = socket.data.userId;

    await prisma.messageReadReceipt.upsert({
      where: {
        messageId_userId: {
          messageId: data.messageId,
          userId
        }
      },
      create: {
        messageId: data.messageId,
        userId
      },
      update: {
        readAt: new Date()
      }
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId
        }
      },
      data: {
        lastReadAt: new Date()
      }
    });

    // Notify other participants
    socket.to(`conversation:${data.conversationId}`).emit('message:read', {
      messageId: data.messageId,
      userId
    });
  });
}
```

### Presence Handler (`/server/src/handlers/presence.handler.ts`)

```typescript
import { Server, Socket } from 'socket.io';
import { redis } from '../utils/redis';

const ONLINE_USERS_KEY = 'online_users';

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // User comes online
  socket.on('presence:online', async () => {
    await redis.sadd(ONLINE_USERS_KEY, userId);

    // Broadcast to all connected users
    io.emit('presence:user_online', { userId });
  });

  // User goes offline (also on disconnect)
  const handleOffline = async () => {
    await redis.srem(ONLINE_USERS_KEY, userId);
    io.emit('presence:user_offline', { userId });
  };

  socket.on('presence:offline', handleOffline);
  socket.on('disconnect', handleOffline);

  // Get online status
  socket.on('presence:check', async (userIds: string[]) => {
    const onlineUsers = await redis.smismember(ONLINE_USERS_KEY, userIds);

    const statuses = userIds.map((id, index) => ({
      userId: id,
      online: onlineUsers[index] === 1
    }));

    socket.emit('presence:status', statuses);
  });
}
```

### Typing Handler (`/server/src/handlers/typing.handler.ts`)

```typescript
import { Server, Socket } from 'socket.io';

export function registerTypingHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on('typing:start', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:user_start', {
      userId,
      conversationId
    });
  });

  socket.on('typing:stop', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('typing:user_stop', {
      userId,
      conversationId
    });
  });
}
```

### Group Handler (`/server/src/handlers/group.handler.ts`)

```typescript
import { Server, Socket } from 'socket.io';
import { prisma } from '../utils/prisma';

export function registerGroupHandlers(io: Server, socket: Socket) {

  // Create group
  socket.on('group:create', async (data: {
    name: string;
    description?: string;
    category: string;
    memberIds: string[];
  }) => {
    const userId = socket.data.userId;

    try {
      // Create conversation and group in transaction
      const group = await prisma.$transaction(async (tx) => {
        const conversation = await tx.conversation.create({
          data: {
            type: 'GROUP',
            participants: {
              create: [
                { userId }, // Creator
                ...data.memberIds.map(id => ({ userId: id }))
              ]
            }
          }
        });

        return await tx.group.create({
          data: {
            conversationId: conversation.id,
            name: data.name,
            description: data.description,
            category: data.category as any,
            createdById: userId
          },
          include: {
            conversation: {
              include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true
                      }
                    }
                  }
                }
              }
            }
          }
        });
      });

      // Notify all members
      const memberSockets = Array.from(io.sockets.sockets.values())
        .filter(s =>
          data.memberIds.includes(s.data.userId) ||
          s.data.userId === userId
        );

      memberSockets.forEach(s => {
        s.join(`conversation:${group.conversationId}`);
        s.emit('group:created', group);
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to create group' });
    }
  });

  // Add member to group
  socket.on('group:add_member', async (data: {
    groupId: string;
    userId: string;
  }) => {
    // Verify requester is group admin/creator
    const group = await prisma.group.findUnique({
      where: { id: data.groupId }
    });

    if (!group || group.createdById !== socket.data.userId) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }

    await prisma.conversationParticipant.create({
      data: {
        conversationId: group.conversationId,
        userId: data.userId
      }
    });

    // Notify conversation room
    io.to(`conversation:${group.conversationId}`).emit('group:member_added', {
      groupId: data.groupId,
      userId: data.userId
    });
  });
}
```

---

## Phase 5: Client-Side Integration

### React Hook for Socket Connection

Create `/lib/socket/useSocket.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from './client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSocket().then(s => {
      if (!mounted) return;

      setSocket(s);
      setConnected(s.connected);

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { socket, connected };
}
```

### Chat Component Example

```typescript
'use client';

import { useSocket } from '@/lib/socket/useSocket';
import { useEffect, useState } from 'react';

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Join conversation
    socket.emit('join:conversation', conversationId);

    // Listen for new messages
    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('message:new');
    };
  }, [socket, conversationId]);

  const sendMessage = () => {
    if (!socket || !input.trim()) return;

    socket.emit('message:send', {
      conversationId,
      content: input,
      type: 'TEXT'
    });

    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg: any) => (
          <div key={msg.id}>
            <strong>{msg.sender.name}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />

      <button onClick={sendMessage}>Send</button>

      {!connected && <div>Disconnected...</div>}
    </div>
  );
}
```

---

## Phase 6: Server Actions for REST Operations

Create `/lib/actions/chat.ts`:

```typescript
'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

// Get or create direct conversation
export async function getOrCreateConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const userId = session.user.id;

  // Find existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'DIRECT',
      participants: {
        every: {
          userId: {
            in: [userId, otherUserId]
          }
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          }
        }
      }
    }
  });

  if (existing) {
    return { data: existing };
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: {
        create: [
          { userId },
          { userId: otherUserId }
        ]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          }
        }
      }
    }
  });

  return { data: conversation };
}

// Get conversation history
export async function getConversationMessages(
  conversationId: string,
  limit = 50,
  before?: string // cursor-based pagination
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id
      }
    }
  });

  if (!participant) {
    return { error: 'Not authorized' };
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before && {
        createdAt: {
          lt: new Date(before)
        }
      })
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      readReceipts: {
        select: {
          userId: true,
          readAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return { data: messages.reverse() };
}

// Get user's conversations
export async function getUserConversations() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          }
        }
      },
      group: true,
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return { data: conversations };
}

// Search groups
export async function searchGroups(query?: string, category?: string) {
  const groups = await prisma.group.findMany({
    where: {
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category: category as any })
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      conversation: {
        include: {
          participants: {
            select: {
              userId: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return { data: groups };
}
```

---

## Phase 7: Deployment Configuration

### Environment Variables

Add to `.env`:

```bash
# Socket.io Server
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001  # Update for production

# Redis
REDIS_URL=redis://localhost:6379  # Update for production
```

### Production Deployment Options

**Option A: Single Server (Simpler)**
- Run Socket.io server as separate process on same machine
- Use PM2 or systemd to manage both processes
- Redis on same server or managed service

**Option B: Separate Servers (Scalable)**
- Deploy Socket.io server separately (Render, Railway, Fly.io)
- Use managed Redis (Upstash, Redis Cloud, AWS ElastiCache)
- Next.js on Vercel/Netlify
- Load balancer for Socket.io horizontal scaling

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  socket-server:
    build: ./server
    ports:
      - '3001:3001'
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      - redis

volumes:
  redis_data:
```

### PM2 Configuration (Production)

```json
{
  "apps": [
    {
      "name": "localroots-app",
      "script": "npm",
      "args": "start",
      "cwd": "/app",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      }
    },
    {
      "name": "localroots-socket",
      "script": "npm",
      "args": "start",
      "cwd": "/app/server",
      "env": {
        "NODE_ENV": "production",
        "SOCKET_PORT": 3001
      }
    }
  ]
}
```

---

## Phase 8: Testing Strategy

### Unit Tests

- Prisma model validations
- Server action authorization logic
- Message formatting utilities

### Integration Tests

- Socket.io event handlers with in-memory Redis
- Authentication middleware
- Database transactions for group creation

### E2E Tests

- Full chat flow (connect → join → send → receive)
- Group creation and member management
- Presence tracking
- Message read receipts

### Load Testing

- Use Socket.io load testing tool
- Simulate concurrent users
- Test Redis pub/sub performance
- Monitor memory usage

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Add Prisma schema models
- [ ] Run migrations
- [ ] Set up Socket.io server structure
- [ ] Configure Redis connection
- [ ] Implement authentication middleware

### Week 2: Core Chat
- [ ] Chat event handlers (send, receive, join)
- [ ] Server actions for conversations
- [ ] Basic chat UI component
- [ ] Message persistence
- [ ] Real-time message delivery

### Week 3: Features
- [ ] Typing indicators
- [ ] Presence tracking (online/offline)
- [ ] Message read receipts
- [ ] File/image uploads for chat
- [ ] Conversation list UI

### Week 4: Groups
- [ ] Group creation logic
- [ ] Group event handlers
- [ ] Group discovery/search UI
- [ ] Member management
- [ ] Group categories

### Week 5: Polish
- [ ] Notifications (unread counts)
- [ ] Emoji support
- [ ] Message editing/deletion
- [ ] User blocking
- [ ] Admin moderation tools

### Week 6: Testing & Deployment
- [ ] Integration tests
- [ ] Load testing
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation

---

## API Reference

### Socket Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join:conversation` | `conversationId: string` | Join conversation room |
| `message:send` | `{ conversationId, content, type }` | Send message |
| `message:read` | `{ conversationId, messageId }` | Mark message as read |
| `typing:start` | `conversationId: string` | Start typing indicator |
| `typing:stop` | `conversationId: string` | Stop typing indicator |
| `presence:online` | - | Mark user as online |
| `presence:check` | `userIds: string[]` | Check online status |
| `group:create` | `{ name, description, category, memberIds }` | Create group |
| `group:add_member` | `{ groupId, userId }` | Add member to group |

### Socket Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `Message` | New message received |
| `message:read` | `{ messageId, userId }` | Message read by user |
| `typing:user_start` | `{ userId, conversationId }` | User started typing |
| `typing:user_stop` | `{ userId, conversationId }` | User stopped typing |
| `presence:user_online` | `{ userId }` | User came online |
| `presence:user_offline` | `{ userId }` | User went offline |
| `presence:status` | `Array<{ userId, online }>` | Online status response |
| `group:created` | `Group` | Group created |
| `group:member_added` | `{ groupId, userId }` | Member added to group |

---

## Monitoring & Observability

### Metrics to Track

- Active WebSocket connections
- Messages per second
- Redis pub/sub latency
- Database query performance
- Failed message delivery rate
- Average message delivery time

### Recommended Tools

- **Application Monitoring**: Sentry, DataDog
- **Redis Monitoring**: RedisInsight, Redis Cloud dashboard
- **Logs**: Winston/Pino with log aggregation (Logtail, Papertrail)
- **Uptime**: UptimeRobot, Better Uptime

---

## Security Considerations

### Authentication
- ✅ JWT verification on socket connection
- ✅ Verify user membership before joining conversations
- ✅ Rate limiting on message sending

### Data Validation
- Sanitize message content (prevent XSS)
- Validate file uploads (type, size)
- Implement message length limits

### Privacy
- Encrypt messages at rest (optional)
- Implement user blocking
- Add report/moderation system
- GDPR compliance (data export, deletion)

### Rate Limiting
```typescript
// Example: 10 messages per 10 seconds per user
const messageRateLimiter = new Map<string, number[]>();

socket.on('message:send', async (data) => {
  const userId = socket.data.userId;
  const now = Date.now();

  const userMessages = messageRateLimiter.get(userId) || [];
  const recentMessages = userMessages.filter(t => now - t < 10000);

  if (recentMessages.length >= 10) {
    socket.emit('error', { message: 'Rate limit exceeded' });
    return;
  }

  recentMessages.push(now);
  messageRateLimiter.set(userId, recentMessages);

  // ... proceed with message sending
});
```

---

## Future Enhancements

- [ ] Voice/video calling (WebRTC)
- [ ] Message search (Elasticsearch)
- [ ] Push notifications (FCM, APNs)
- [ ] Message reactions (emoji)
- [ ] Threads/replies
- [ ] Message forwarding
- [ ] Scheduled messages
- [ ] Chatbots/automated responses
- [ ] Translation (multi-language support)
- [ ] AI moderation (toxic content detection)

---

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)
- [Socket.io Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [WebSocket Security](https://owasp.org/www-community/vulnerabilities/WebSocket_Security)

---

**End of Implementation Plan**