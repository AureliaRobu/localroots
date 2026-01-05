'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useChatContextSafe } from '@/lib/socket'

export function ChatButton() {
  const locale = useLocale()
  const chatContext = useChatContextSafe()

  // Get unread count if context is available
  const unreadCount = chatContext?.totalUnreadCount ?? 0

  return (
    <Link href={`/${locale}/messages`}>
      <Button variant="ghost" size="icon" className="relative">
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Messages</span>
      </Button>
    </Link>
  )
}
