'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateCartItemQuantity as updateCartItemQuantityAction } from '@/lib/actions/cart'

type CartItem = {
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
      name: string | null
      email: string
      image: string | null
      farmerProfile: {
        farmName: string
      } | null
    }
  }
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  isLoading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCart = useCallback(async () => {
    setIsLoading(true)
    const result = await getCart()
    if (result.success && result.data) {
      setItems(result.data.items)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    // Optimistic update
    setIsLoading(true)
    const result = await addToCartAction(productId, quantity)
    if (result.success) {
      await loadCart()
    }
    setIsLoading(false)
  }, [loadCart])

  const removeFromCart = useCallback(async (cartItemId: string) => {
    setIsLoading(true)
    const result = await removeFromCartAction(cartItemId)
    if (result.success) {
      await loadCart()
    }
    setIsLoading(false)
  }, [loadCart])

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    setIsLoading(true)
    const result = await updateCartItemQuantityAction(cartItemId, quantity)
    if (result.success) {
      await loadCart()
    }
    setIsLoading(false)
  }, [loadCart])

  const refreshCart = useCallback(async () => {
    await loadCart()
  }, [loadCart])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
