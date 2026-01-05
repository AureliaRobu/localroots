'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { getOrCreateConversation } from '@/lib/actions/chat'
import { MessageCircle, Loader2 } from 'lucide-react'

interface MessageFarmerButtonProps {
  farmerId: string
  farmerName?: string | null
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function MessageFarmerButton({
  farmerId,
  farmerName,
  variant = 'outline',
  size = 'default',
  className
}: MessageFarmerButtonProps) {
  const router = useRouter()
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const result = await getOrCreateConversation(farmerId)
      if (result.success) {
        router.push(`/${locale}/messages/${result.data.id}`)
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Message {farmerName || 'Farmer'}
    </Button>
  )
}
