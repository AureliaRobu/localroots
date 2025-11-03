'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { checkoutFormSchema, updateOrderStatusSchema } from '@/lib/validations/order'
import type { CheckoutFormData, UpdateOrderStatusData } from '@/lib/validations/order'

/**
 * Create an order from the user's cart
 */
export async function createOrder(formData: CheckoutFormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate form data
    const validatedData = checkoutFormSchema.parse(formData)

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Calculate total and prepare order items
    let total = 0
    const orderItems = cart.items.map((item) => {
      const itemTotal = item.product.price * item.quantity
      total += itemTotal

      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        productName: item.product.name,
      }
    })

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          paymentMethod: validatedData.paymentMethod,
          paymentStatus: validatedData.paymentMethod === 'CASH_ON_DELIVERY' ? 'pending' : null,
          total,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          deliveryAddress: validatedData.deliveryAddress,
          notes: validatedData.notes || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Clear the cart after successful order creation
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return newOrder
    })

    revalidatePath('/cart')
    revalidatePath('/customer/orders')

    return {
      success: true,
      data: order,
      message: 'Order created successfully'
    }
  } catch (error) {
    console.error('Error creating order:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create order' }
  }
}

/**
 * Get all orders for the current user (customer view)
 */
export async function getCustomerOrders() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const orders = await prisma.order.findMany({
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error('Error getting customer orders:', error)
    return { success: false, error: 'Failed to get orders' }
  }
}

/**
 * Get all orders containing products from the current farmer
 */
export async function getFarmerOrders() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (user.role !== 'FARMER') {
      return { success: false, error: 'Not authorized' }
    }

    // Get all orders that contain at least one product from this farmer
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              farmerId: user.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          where: {
            product: {
              farmerId: user.id,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error('Error getting farmer orders:', error)
    return { success: false, error: 'Failed to get orders' }
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Check if user is authorized to view this order
    const isCustomer = order.userId === user.id
    const isFarmer = order.items.some(item => item.product.farmerId === user.id)

    if (!isCustomer && !isFarmer && user.role !== 'ADMIN') {
      return { success: false, error: 'Not authorized' }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error('Error getting order:', error)
    return { success: false, error: 'Failed to get order' }
  }
}

/**
 * Update order status (for farmers and admins)
 */
export async function updateOrderStatus(data: UpdateOrderStatusData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate data
    const validatedData = updateOrderStatusSchema.parse(data)

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Check authorization - must be farmer of products in order or admin
    const isFarmer = order.items.some(item => item.product.farmerId === user.id)

    if (!isFarmer && user.role !== 'ADMIN') {
      return { success: false, error: 'Not authorized' }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: validatedData.orderId },
      data: { status: validatedData.status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    revalidatePath('/farmer/orders')
    revalidatePath('/customer/orders')
    revalidatePath(`/orders/${validatedData.orderId}`)

    return {
      success: true,
      data: updatedOrder,
      message: 'Order status updated'
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update order status' }
  }
}

/**
 * Cancel an order (customer can cancel pending orders)
 */
export async function cancelOrder(orderId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Only order owner can cancel
    if (order.userId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    // Can only cancel pending orders
    if (order.status !== 'PENDING') {
      return { success: false, error: 'Can only cancel pending orders' }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    })

    revalidatePath('/customer/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      data: updatedOrder,
      message: 'Order cancelled'
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return { success: false, error: 'Failed to cancel order' }
  }
}
