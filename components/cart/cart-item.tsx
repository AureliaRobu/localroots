'use client'

import { useCart } from '@/lib/context/cart-context'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

type CartItemProps = {
  item: {
    id: string
    productId: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      unit: string
      imageUrl: string | null
      inStock: boolean
      farmer: {
        id: string
        farmName: string | null
      }
    }
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const t = useTranslations('cart')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(true)
    try {
      await updateQuantity(item.id, newQuantity)
    } catch (error) {
      toast.error(t('updateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeFromCart(item.id)
      toast.success(t('removed'))
    } catch (error) {
      toast.error(t('removeError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const itemTotal = item.product.price * item.quantity

  return (
    <div className="flex gap-4 border rounded-lg p-4">
      <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            {t('noImage')}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground truncate">
          {item.product.farmer.farmName || t('unknownFarmer')}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">${itemTotal.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            (${item.product.price.toFixed(2)}/{item.product.unit})
          </span>
        </div>
        {!item.product.inStock && (
          <p className="text-xs text-destructive mt-1">{t('outOfStock')}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
