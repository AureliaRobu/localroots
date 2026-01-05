'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getAvailableChatUsers, getOrCreateConversation } from '@/lib/actions/chat'
import { ArrowLeft, Search, Loader2, Leaf, ShoppingBag } from 'lucide-react'

interface User {
  id: string
  name: string | null
  image: string | null
  role: string
  farmName?: string
}

interface NewConversationClientProps {
  currentUserId: string
  locale: string
}

export function NewConversationClient({ currentUserId, locale }: NewConversationClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    const result = await getAvailableChatUsers({
      search: debouncedQuery || undefined,
      limit: 20
    })
    if (result.success) {
      setUsers(result.data)
    }
    setIsLoading(false)
  }, [debouncedQuery])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleStartConversation = async (userId: string) => {
    setIsStarting(userId)
    const result = await getOrCreateConversation(userId)
    if (result.success) {
      router.push(`/${locale}/messages/${result.data.id}`)
    }
    setIsStarting(null)
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/messages`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">New Message</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {debouncedQuery ? (
              <p>No users found for &quot;{debouncedQuery}&quot;</p>
            ) : (
              <p>No users available</p>
            )}
          </div>
        ) : (
          <div className="p-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleStartConversation(user.id)}
                disabled={isStarting !== null}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {user.name || 'Unknown'}
                    </span>
                    <Badge variant="secondary" className="shrink-0">
                      {user.role === 'FARMER' ? (
                        <span className="flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          Farmer
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          Customer
                        </span>
                      )}
                    </Badge>
                  </div>
                  {user.farmName && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.farmName}
                    </p>
                  )}
                </div>

                {isStarting === user.id && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
