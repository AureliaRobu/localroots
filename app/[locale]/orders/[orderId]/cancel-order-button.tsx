'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelOrder } from '@/lib/actions/order'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface CancelOrderButtonProps {
  orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter()
  const t = useTranslations('OrderDetails')
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const result = await cancelOrder(orderId)

      if (result.success) {
        toast.success(t('orderCancelled'))
        router.refresh()
      } else {
        toast.error(result.error || t('cancelFailed'))
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error(t('cancelFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {t('cancelOrder')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('cancelOrderTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('cancelOrderDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('keepOrder')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
            {isLoading ? t('cancelling') : t('confirmCancel')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
