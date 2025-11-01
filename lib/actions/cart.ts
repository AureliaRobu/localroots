'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * Get the current user's cart with all items and product details
 */
export async function getCart() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  select: {
                    id: true,
                    name: true,
                    farmerProfile: {
                      select: {
                        farmName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            addedAt: 'desc', // Most recently added first
          },
        },
      },
    })

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  farmer: {
                    select: {
                      id: true,
                      name: true,
                      farmerProfile: {
                        select: {
                          farmName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    }

    return { success: true, data: cart }
  } catch (error) {
    console.error('Error getting cart:', error)
    return { success: false, error: 'Failed to get cart' }
  }
}

/**
 * Add a product to the cart or update quantity if already exists
 */
export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate quantity
    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' }
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    if (!product.inStock) {
      return { success: false, error: 'Product is out of stock' }
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      })
    }

    // Check if product already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    })

    if (existingCartItem) {
      // Update quantity of existing item
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      })
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    revalidatePath('/cart')
    return { success: true, message: 'Added to cart' }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Failed to add to cart' }
  }
}

/**
 * Update the quantity of a cart item
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate quantity
    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' }
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    })

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return { success: false, error: 'Cart item not found' }
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })

    revalidatePath('/cart')
    return { success: true, message: 'Quantity updated' }
  } catch (error) {
    console.error('Error updating cart item:', error)
    return { success: false, error: 'Failed to update quantity' }
  }
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(cartItemId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    })

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return { success: false, error: 'Cart item not found' }
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })

    revalidatePath('/cart')
    return { success: true, message: 'Item removed from cart' }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error: 'Failed to remove item' }
  }
}

/**
 * Clear all items from the cart
 */
export async function clearCart() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (!cart) {
      return { success: true, message: 'Cart already empty' }
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    revalidatePath('/cart')
    return { success: true, message: 'Cart cleared' }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

/**
 * Get the total number of items in cart (for badge counter)
 */
export async function getCartItemCount() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
    })

    if (!cart) {
      return { success: true, data: 0 }
    }

    // Sum up all quantities
    const totalItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return { success: true, data: totalItems }
  } catch (error) {
    console.error('Error getting cart item count:', error)
    return { success: false, error: 'Failed to get cart count' }
  }
}
