# LocalRoots Chat Server

Real-time chat server for LocalRoots using Socket.io, Redis, and PostgreSQL.

## Prerequisites

- Node.js 20+
- Redis server running locally or remotely
- Access to the same PostgreSQL database as the main Next.js app

## Installation

```bash
npm install
```

## Environment Variables

The server reads from the parent `.env` file. Required variables:

```env
# Database (same as Next.js app)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth (same as Next.js app)
AUTH_SECRET=your-secret-here

# Socket.io
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Redis
REDIS_URL=redis://localhost:6379
```

## Running the Server

### Development mode (with hot reload)
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

## Architecture

- **Socket.io Server**: Handles WebSocket connections on port 3001
- **Redis Adapter**: Enables horizontal scaling with pub/sub pattern
- **JWT Authentication**: Verifies NextAuth tokens from client connections
- **Prisma Client**: Shares the same database as the Next.js app

## Structure

```
server/
├── src/
│   ├── handlers/       # Event handlers (Phase 4)
│   ├── middleware/     # Authentication middleware
│   ├── utils/          # Redis and Prisma clients
│   ├── server.ts       # Main Socket.io server
│   └── index.ts        # Entry point
├── package.json
└── tsconfig.json
```

## Development Notes

- The server runs independently from the Next.js app
- Event handlers will be added in Phase 4
- Redis must be running before starting the server
- The server uses the Prisma client from the parent project

## Starting Redis (Development)

### Using Docker
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Using Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

### Using apt (Linux)
```bash
sudo apt install redis-server
sudo systemctl start redis
```
