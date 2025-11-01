'use client'

import { useCart } from '@/lib/context/cart-context'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CartItem } from './cart-item'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

type CartDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, totalPrice, isLoading, itemCount } = useCart()
  const t = useTranslations('cart')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('title')}
            {itemCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({itemCount} {itemCount === 1 ? t('item') : t('items')})
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {t('description')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t('empty')}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-300px)]">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('total')}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout" onClick={() => onOpenChange(false)}>
                      {t('checkout')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    <Link href="/products">
                      {t('continueShopping')}
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
