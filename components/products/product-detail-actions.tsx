'use client'

import { AddToCartButton } from '@/components/cart/add-to-cart-button'

type ProductDetailActionsProps = {
  productId: string
  inStock: boolean
}

export function ProductDetailActions({ productId, inStock }: ProductDetailActionsProps) {
  return (
    <div className="pt-4">
      <AddToCartButton
        productId={productId}
        inStock={inStock}
        className="w-full"
      />
    </div>
  )
}
