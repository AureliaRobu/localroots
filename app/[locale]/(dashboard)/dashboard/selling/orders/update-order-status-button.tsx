'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/lib/actions/order'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UpdateOrderStatusButtonProps {
  orderId: string
  newStatus: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  label: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function UpdateOrderStatusButton({
  orderId,
  newStatus,
  label,
  variant = 'default',
}: UpdateOrderStatusButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateStatus = async () => {
    setIsLoading(true)

    try {
      const result = await updateOrderStatus({
        orderId,
        status: newStatus,
      })

      if (result.success) {
        toast.success('Order status updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpdateStatus}
      disabled={isLoading}
      variant={variant}
    >
      {isLoading ? 'Updating...' : label}
    </Button>
  )
}
