'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGroup } from '@/lib/actions/chat'
import { ArrowLeft, Loader2, Users } from 'lucide-react'
import type { GroupCategory } from '@prisma/client'

interface NewGroupClientProps {
  currentUserId: string
  locale: string
}

const CATEGORY_OPTIONS: Array<{ value: GroupCategory; label: string; description: string }> = [
  { value: 'GENERAL', label: 'General', description: 'General discussions' },
  { value: 'FOOD_SHARE', label: 'Food Sharing', description: 'Share surplus food with others' },
  { value: 'NEWS', label: 'News & Updates', description: 'Local news and updates' },
  { value: 'RECIPES', label: 'Recipes', description: 'Share and discover recipes' },
  { value: 'TIPS', label: 'Tips & Advice', description: 'Farming and cooking tips' },
  { value: 'LOCAL_EVENTS', label: 'Local Events', description: 'Events in your area' }
]

export function NewGroupClient({ currentUserId, locale }: NewGroupClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GroupCategory>('GENERAL')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Group name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    const result = await createGroup({
      name: name.trim(),
      description: description.trim() || undefined,
      category
    })

    if (result.success) {
      router.push(`/${locale}/messages/${result.data.conversationId}`)
    } else {
      setError(result.error)
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/messages/groups`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Create Group</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as GroupCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !name.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
