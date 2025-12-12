import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getOrderById } from '@/lib/actions/order'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CancelOrderButton } from './cancel-order-button'
import { ReviewButton } from '@/components/reviews/review-button'
import { format } from 'date-fns'

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const user = await getCurrentUser()
  const t = await getTranslations('OrderDetails')

  if (!user) {
    redirect('/login')
  }

  const { orderId } = await params
  const orderResult = await getOrderById(orderId)

  if (!orderResult.success || !orderResult.data) {
    redirect('/customer/dashboard')
  }

  const order = orderResult.data

  // Check if current user is the order owner (can be either FARMER or CUSTOMER role)
  const isOrderOwner = order.userId === user.id
  const isFarmer = user.role === 'FARMER'

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

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('orderId')}: {order.id}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('orderDate')}: {format(new Date(order.createdAt), 'PPP')}
          </p>
        </div>
        <Badge className={getStatusBadgeColor(order.status)}>
          {order.status}
        </Badge>
      </div>

      {/* Order Details Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Customer Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('customerInfo')}</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t('name')}:</span>{' '}
              {order.customerName}
            </div>
            <div>
              <span className="font-medium">{t('email')}:</span>{' '}
              {order.customerEmail}
            </div>
            <div>
              <span className="font-medium">{t('phone')}:</span>{' '}
              {order.customerPhone}
            </div>
            <div>
              <span className="font-medium">{t('address')}:</span>{' '}
              {order.deliveryAddress}
            </div>
            {order.notes && (
              <div>
                <span className="font-medium">{t('notes')}:</span>{' '}
                {order.notes}
              </div>
            )}
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('paymentInfo')}</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t('paymentMethod')}:</span>{' '}
              {order.paymentMethod === 'CASH_ON_DELIVERY'
                ? t('cashOnDelivery')
                : t('creditCard')}
            </div>
            {order.paymentStatus && (
              <div>
                <span className="font-medium">{t('paymentStatus')}:</span>{' '}
                {order.paymentStatus}
              </div>
            )}
            <div className="text-2xl font-bold pt-2">
              {t('total')}: ${order.total.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('orderItems')}</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between border-b pb-4 last:border-b-0"
            >
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                {item.product.farmer && (
                  <p className="text-sm text-muted-foreground">
                    {t('from')}{' '}
                    {item.product.farmer.farmerProfile?.farmName ||
                      item.product.farmer.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x ${item.priceAtPurchase.toFixed(2)}
                </p>
                {isOrderOwner && (
                  <div className="mt-2">
                    <ReviewButton
                      productId={item.productId}
                      productName={item.productName}
                      orderId={order.id}
                      orderStatus={order.status}
                    />
                  </div>
                )}
              </div>
              <p className="font-medium">
                ${(item.priceAtPurchase * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      {isOrderOwner && order.status === 'PENDING' && (
        <div className="flex justify-end">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  )
}
