'use client'

import { usePathname } from 'next/navigation'
import { ConversationList } from '@/components/chat/ConversationList'
import { cn } from '@/lib/utils'

interface MessagesLayoutClientProps {
  children: React.ReactNode
  userId: string
}

export function MessagesLayoutClient({ children, userId }: MessagesLayoutClientProps) {
  const pathname = usePathname()

  // Check if we're viewing a specific conversation
  const isConversationView = pathname.includes('/messages/') &&
    !pathname.endsWith('/messages') &&
    !pathname.endsWith('/messages/new') &&
    !pathname.endsWith('/messages/groups') &&
    !pathname.includes('/messages/groups/new')

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - hidden on mobile when viewing conversation */}
      <aside
        className={cn(
          'w-full md:w-80 border-r bg-background flex-shrink-0',
          isConversationView && 'hidden md:block'
        )}
      >
        <ConversationList
          currentUserId={userId}
          className="h-full flex flex-col"
        />
      </aside>

      {/* Main content - hidden on mobile when not viewing conversation */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !isConversationView && 'hidden md:flex'
        )}
      >
        {children}
      </main>
    </div>
  )
}
