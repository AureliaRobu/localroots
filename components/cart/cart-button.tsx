'use client'

import { useState } from 'react'
import { useCart } from '@/lib/context/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { CartDrawer } from './cart-drawer'

export function CartButton() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
