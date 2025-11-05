import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getFarmerOrders } from '@/lib/actions/order'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UpdateOrderStatusButton } from './update-order-status-button'
import { format } from 'date-fns'

export default async function FarmerOrdersPage() {
  const user = await getCurrentUser()
  const t = await getTranslations('FarmerOrders')

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'FARMER') {
    redirect('/dashboard')
  }

  const ordersResult = await getFarmerOrders()

  if (!ordersResult.success) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-red-500">{ordersResult.error}</p>
      </div>
    )
  }

  const orders = ordersResult.data || []

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500'
      case 'CONFIRMED':
        return 'bg-blue-500'
      case 'COMPLETED':
        return 'bg-green-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Calculate order subtotal for farmer's items only
  const calculateFarmerTotal = (order: (typeof orders)[0]) => {
    return order.items.reduce((sum, item) => {
      return sum + item.priceAtPurchase * item.quantity
    }, 0)
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t('noOrders')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const farmerTotal = calculateFarmerTotal(order)

            return (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {t('order')} #{order.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${farmerTotal.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.paymentMethod === 'CASH_ON_DELIVERY'
                        ? t('cashOnDelivery')
                        : t('creditCard')}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium mb-2">{t('customerInfo')}</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      {t('name')}: {order.customerName}
                    </p>
                    <p>
                      {t('email')}: {order.customerEmail}
                    </p>
                    <p>
                      {t('phone')}: {order.customerPhone}
                    </p>
                    <p>
                      {t('address')}: {order.deliveryAddress}
                    </p>
                    {order.notes && (
                      <p>
                        {t('notes')}: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium mb-2">{t('items')}</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <span className="text-muted-foreground">
                          ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Buttons */}
                {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <UpdateOrderStatusButton
                        orderId={order.id}
                        newStatus="CONFIRMED"
                        label={t('confirmOrder')}
                        variant="default"
                      />
                    )}
                    {order.status === 'CONFIRMED' && (
                      <UpdateOrderStatusButton
                        orderId={order.id}
                        newStatus="COMPLETED"
                        label={t('markCompleted')}
                        variant="default"
                      />
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
