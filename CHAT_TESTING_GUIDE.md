# Chat System Manual Testing Guide

## Prerequisites

### 1. Start Redis
Redis is needed for presence and real-time features.

```bash
redis-server
```

Or using Docker:
```bash
docker run -d -p 6379:6379 redis
```

### 2. Start the Socket.io Server
In a separate terminal:

```bash
cd server && npm run dev
```

Expected output:
```
Starting LocalRoots Chat Server...
Redis Pub/Sub clients connected
Socket.io server listening on port 3001
Chat server started successfully
```

### 3. Start the Next.js App
In another terminal:

```bash
npm run dev
```

---

## Test Scenarios

### Test 1: Access Messages Page

1. Open http://localhost:3000
2. Log in as a user (customer or farmer)
3. Click the **chat icon** in the header (next to cart)
4. You should see the messages page with sidebar

**Expected:** Empty state saying "Select a conversation to start messaging"

---

### Test 2: Start New Conversation

1. On the messages page, click the **"+" icon** (New Message button)
2. You should see a user search page
3. Search for a user or browse the list
4. Click on a user to start a conversation

**Expected:** Redirects to the chat with that user

---

### Test 3: Send Messages

1. In a conversation, type a message in the input field
2. Press Enter or click Send

**Expected:** Message appears in the chat, shows as sent

---

### Test 4: Real-time Messaging (Two Browsers)

1. Open **Browser 1**: Log in as User A
2. Open **Browser 2** (or incognito): Log in as User B
3. Start a conversation between them
4. Send messages from both sides

**Expected:** Messages appear instantly in both browsers without refresh

---

### Test 5: Message Farmer from Product Page

1. Go to http://localhost:3000/products
2. Click on any product to view details
3. Scroll to "About the Farmer" section
4. Click **"Message [Farmer Name]"** button

**Expected:** Creates/opens conversation with that farmer

---

### Test 6: Create Groups

1. Go to Messages → Click **"Groups"** tab
2. Click **"Create"** to create a new group
3. Fill in:
   - Group name
   - Description (optional)
   - Category
4. Click "Create Group"

**Expected:** Group is created and you're redirected to the group chat

---

### Test 7: Browse & Join Groups

1. Go to Messages → Groups
2. Browse available groups
3. Filter by category if needed
4. Click **"Join"** on a group you're not a member of

**Expected:** You join the group and can see the chat

---

### Test 8: Online Status

1. Have two users logged in in different browsers
2. Check if online indicator (green dot) shows correctly on conversation items
3. Close one browser tab
4. Check the other browser

**Expected:** User shows as offline after a moment

---

### Test 9: Typing Indicator

1. Open a conversation in two browsers (same conversation, different users)
2. Start typing in one browser

**Expected:** Other browser shows "[Name] is typing..."

---

### Test 10: Mobile Responsiveness

1. Open browser dev tools (F12)
2. Toggle device toolbar (mobile view)
3. Navigate through messages

**Expected:**
- Conversation list takes full screen on mobile
- Clicking a conversation shows full-screen chat
- Back button returns to conversation list

---

## Test Checklist

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Chat icon visible in header | ☐ | |
| 2 | Messages page loads | ☐ | |
| 3 | Conversation list displays | ☐ | |
| 4 | Search conversations works | ☐ | |
| 5 | New conversation flow works | ☐ | |
| 6 | User search works | ☐ | |
| 7 | Sending messages works | ☐ | |
| 8 | Receiving messages works | ☐ | |
| 9 | Real-time delivery works | ☐ | |
| 10 | Message Farmer button works | ☐ | |
| 11 | Groups page loads | ☐ | |
| 12 | Create group works | ☐ | |
| 13 | Join group works | ☐ | |
| 14 | Group chat works | ☐ | |
| 15 | Online indicators work | ☐ | |
| 16 | Typing indicators work | ☐ | |
| 17 | Unread badge updates | ☐ | |
| 18 | Mobile layout works | ☐ | |
| 19 | Back navigation works | ☐ | |

---

## Troubleshooting

### Socket.io server won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Kill existing process: `kill -9 <PID>`

### Redis connection errors
- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check Redis URL in `.env`: `REDIS_URL=redis://localhost:6379`

### Messages not sending
- Check browser console for errors
- Verify Socket.io connection in Network tab (should see WebSocket connection)
- Check server logs for errors

### Authentication errors
- Make sure you're logged in
- Check that `AUTH_SECRET` is set in `.env`
- Verify the session is valid

### Prisma errors in server
- Run `cd server && npm install` to regenerate Prisma client
- Ensure database is accessible

---

## Environment Variables

The server loads environment variables from the parent `.env` file automatically.

Required in `.env`:

```env
# Database
DATABASE_URL=your-database-url

# Socket.io
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Redis
REDIS_URL=redis://localhost:6379

# Auth (required for JWT validation in socket server)
AUTH_SECRET=your-auth-secret
```

> **Note:** For production on Railway, you'll need to set these environment variables in the Railway dashboard for the socket server service.
