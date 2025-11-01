'use client'

import { useState } from 'react'
import { useCart } from '@/lib/context/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

type AddToCartButtonProps = {
  productId: string
  inStock: boolean
  variant?: 'default' | 'icon'
  className?: string
}

export function AddToCartButton({
  productId,
  inStock,
  variant = 'default',
  className
}: AddToCartButtonProps) {
  const { addToCart, items } = useCart()
  const t = useTranslations('cart')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const cartItem = items.find(item => item.productId === productId)

  const handleAddToCart = async () => {
    if (!inStock) return

    setIsAdding(true)
    try {
      await addToCart(productId, quantity)
      toast.success(t('addedToCart'))
      setQuantity(1)
    } catch (error) {
      toast.error(t('addToCartError'))
    } finally {
      setIsAdding(false)
    }
  }

  if (!inStock) {
    return (
      <Button disabled className={className}>
        {t('outOfStock')}
      </Button>
    )
  }

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={className}
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={isAdding || quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-10 text-center text-sm font-medium">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setQuantity(quantity + 1)}
          disabled={isAdding}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="flex-1"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  )
}
