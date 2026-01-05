'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { searchGroups, joinGroup } from '@/lib/actions/chat'
import { ArrowLeft, Search, Plus, Users, Loader2, Check } from 'lucide-react'
import type { GroupCategory } from '@prisma/client'

interface Group {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  conversationId: string
  memberCount: number
  createdBy: { id: string; name: string | null; image: string | null }
  isMember: boolean
}

interface GroupsClientProps {
  currentUserId: string
  locale: string
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  FOOD_SHARE: 'Food Sharing',
  NEWS: 'News & Updates',
  RECIPES: 'Recipes',
  TIPS: 'Tips & Advice',
  LOCAL_EVENTS: 'Local Events'
}

export function GroupsClient({ currentUserId, locale }: GroupsClientProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load groups
  const loadGroups = useCallback(async () => {
    setIsLoading(true)
    const result = await searchGroups({
      query: debouncedQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory as GroupCategory : undefined,
      limit: 20
    })
    if (result.success) {
      setGroups(result.data)
    }
    setIsLoading(false)
  }, [debouncedQuery, selectedCategory])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleJoinGroup = async (groupId: string, conversationId: string) => {
    setJoiningId(groupId)
    const result = await joinGroup(groupId)
    if (result.success) {
      router.push(`/${locale}/messages/${conversationId}`)
    }
    setJoiningId(null)
  }

  const handleOpenGroup = (conversationId: string) => {
    router.push(`/${locale}/messages/${conversationId}`)
  }

  const getInitials = (name: string) => {
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${locale}/messages`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">Groups</h1>
          </div>
          <Button
            size="sm"
            onClick={() => router.push(`/${locale}/messages/groups/new`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {debouncedQuery || selectedCategory !== 'all' ? (
              <p>No groups found</p>
            ) : (
              <>
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No groups available yet</p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/messages/groups/new`)}
                >
                  Create a group
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {groups.map(group => (
              <div
                key={group.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage src={group.imageUrl || undefined} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{group.name}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      {CATEGORY_LABELS[group.category] || group.category}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {group.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {group.memberCount} members
                    {group.createdBy.name && (
                      <> &middot; Created by {group.createdBy.name}</>
                    )}
                  </p>
                </div>

                {group.isMember ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenGroup(group.conversationId)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleJoinGroup(group.id, group.conversationId)}
                    disabled={joiningId !== null}
                  >
                    {joiningId === group.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Join'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
