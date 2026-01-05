# Chat UI Integration Plan

## Overview

This plan covers integrating the chat system into the LocalRoots UI. All backend work (Socket.io server, handlers, hooks, components, server actions) is complete. This phase focuses on creating pages and wiring everything together.

---

## Current State

### Completed
- [x] Database schema (Prisma models)
- [x] Socket.io server with Redis adapter
- [x] Authentication middleware
- [x] Event handlers (chat, presence, typing, groups)
- [x] Client-side hooks (`useChat`, `useTyping`, `usePresence`)
- [x] UI components (`ChatWindow`, `MessageList`, `ConversationItem`, etc.)
- [x] Server actions (conversations, messages, groups)

### Missing
- [ ] Chat pages/routes
- [ ] ChatProvider integration
- [ ] Entry points (buttons to start chats)
- [ ] Header chat icon with unread badge
- [ ] Mobile-responsive layout

---

## Phase 1: App Layout Integration

### 1.1 Create SocketProvider wrapper

**File:** `components/providers/SocketProvider.tsx`

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { ChatProvider } from '@/lib/socket'

export function SocketProvider({ children }) {
  const { data: session } = useSession()

  // Only render ChatProvider for authenticated users
  if (!session?.user) {
    return <>{children}</>
  }

  return <ChatProvider>{children}</ChatProvider>
}
```

### 1.2 Add to dashboard layouts

Update these layouts to include SocketProvider:
- `app/[locale]/(dashboard)/layout.tsx`

---

## Phase 2: Messages Pages

### 2.1 Page Structure

```
app/[locale]/(dashboard)/messages/
├── layout.tsx              # Split layout: sidebar + content
├── page.tsx                # Conversation list (redirects on desktop)
├── new/
│   └── page.tsx            # Start new conversation
├── groups/
│   ├── page.tsx            # Browse/search groups
│   └── new/
│       └── page.tsx        # Create new group
└── [conversationId]/
    └── page.tsx            # Chat window
```

### 2.2 Messages Layout

**File:** `app/[locale]/(dashboard)/messages/layout.tsx`

Features:
- Desktop: Sidebar (conversation list) + Main area (chat)
- Mobile: Stack navigation (list → chat)
- Responsive breakpoint at `md` (768px)

```tsx
export default function MessagesLayout({ children }) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - hidden on mobile when viewing conversation */}
      <aside className="w-80 border-r hidden md:block">
        <ConversationList />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
```

### 2.3 Conversation List Page

**File:** `app/[locale]/(dashboard)/messages/page.tsx`

Features:
- Fetch conversations via `getUserConversations()`
- Display using `ConversationItem` component
- Real-time updates via socket
- Search/filter conversations
- "New Message" button
- Empty state for no conversations

### 2.4 Chat Page

**File:** `app/[locale]/(dashboard)/messages/[conversationId]/page.tsx`

Features:
- Fetch initial messages via `getConversationMessages()`
- Render `ChatWindow` component
- Header with participant info / group name
- Back button for mobile
- Mark as read on mount

### 2.5 New Conversation Page

**File:** `app/[locale]/(dashboard)/messages/new/page.tsx`

Features:
- Search users via `getAvailableChatUsers()`
- User list with avatars
- Click to start conversation → `getOrCreateConversation()`
- Redirect to new conversation

### 2.6 Groups Page

**File:** `app/[locale]/(dashboard)/messages/groups/page.tsx`

Features:
- Browse groups via `searchGroups()`
- Filter by category
- Join button → `joinGroup()`
- Create group button

---

## Phase 3: Entry Points

### 3.1 Message Farmer Button

**File:** `components/chat/MessageFarmerButton.tsx`

Add to:
- Product detail page (`app/[locale]/products/[id]/page.tsx`)
- Farmer profile (if exists)

```tsx
'use client'

export function MessageFarmerButton({ farmerId, farmerName }) {
  const router = useRouter()

  async function handleClick() {
    const result = await getOrCreateConversation(farmerId)
    if (result.success) {
      router.push(`/messages/${result.data.id}`)
    }
  }

  return (
    <Button onClick={handleClick}>
      <MessageCircle className="mr-2 h-4 w-4" />
      Message {farmerName}
    </Button>
  )
}
```

### 3.2 Header Chat Icon

**File:** `components/layout/ChatButton.tsx`

Features:
- Message icon in header
- Unread count badge
- Link to `/messages`
- Real-time badge updates

Add to: `components/layout/header.tsx`

---

## Phase 4: Mobile Optimizations

### 4.1 Responsive Conversation List

- Full screen on mobile
- Hidden when viewing a conversation
- Swipe gestures (optional)

### 4.2 Responsive Chat View

- Full screen on mobile
- Back button to return to list
- Keyboard handling for input

### 4.3 Bottom Navigation (Optional)

Add messages icon to mobile bottom nav if it exists.

---

## Phase 5: Polish & Enhancements

### 5.1 Loading States

- Skeleton loaders for conversation list
- Loading spinner for messages
- Optimistic UI for sent messages

### 5.2 Empty States

- No conversations: "Start your first conversation"
- No messages: "Say hello!"
- No search results: "No users found"

### 5.3 Error Handling

- Connection lost indicator
- Retry mechanisms
- Toast notifications for errors

### 5.4 Accessibility

- Keyboard navigation
- Screen reader support
- Focus management

---

## Phase 6: Translations

Add translations to message files:

**File:** `messages/en.json`

```json
{
  "chat": {
    "title": "Messages",
    "newMessage": "New Message",
    "noConversations": "No conversations yet",
    "startConversation": "Start a conversation",
    "typeMessage": "Type a message...",
    "send": "Send",
    "online": "Online",
    "offline": "Offline",
    "typing": "{name} is typing...",
    "messageButton": "Message {name}",
    "groups": {
      "title": "Groups",
      "create": "Create Group",
      "join": "Join",
      "leave": "Leave",
      "members": "{count} members"
    }
  }
}
```

---

## Implementation Order

### Day 1: Core Pages
1. [ ] Create SocketProvider wrapper
2. [ ] Add to dashboard layout
3. [ ] Create messages layout with responsive sidebar
4. [ ] Create conversation list page
5. [ ] Create chat page with ChatWindow

### Day 2: New Conversations & Groups
6. [ ] Create new conversation page
7. [ ] Create groups browse page
8. [ ] Create new group page
9. [ ] Add MessageFarmerButton to product pages

### Day 3: Header & Polish
10. [ ] Add ChatButton to header
11. [ ] Add translations
12. [ ] Loading states and skeletons
13. [ ] Empty states
14. [ ] Error handling

### Day 4: Testing & Refinement
15. [ ] Test real-time messaging
16. [ ] Test presence indicators
17. [ ] Test typing indicators
18. [ ] Mobile testing
19. [ ] Fix any issues

---

## Environment Variables

Ensure these are set:

```env
# Already should exist
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# For production
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

---

## Testing Checklist

- [ ] User can see conversation list
- [ ] User can open a conversation
- [ ] User can send and receive messages in real-time
- [ ] Typing indicators work
- [ ] Online/offline status works
- [ ] User can start new direct conversation
- [ ] User can browse and join groups
- [ ] User can create new groups
- [ ] Unread badges update correctly
- [ ] Works on mobile devices
- [ ] Works with multiple browser tabs

---

## Notes

- The Socket.io server needs to be running separately (`cd server && npm run dev`)
- Redis needs to be running for presence/pub-sub features
- All authenticated users can message each other (farmers and customers)
