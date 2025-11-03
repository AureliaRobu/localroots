import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/session'
import { getCustomerOrders } from '@/lib/actions/order'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser()
  const t = await getTranslations('CustomerOrders')

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'CUSTOMER' && user.role !== 'FARMER') {
    redirect('/dashboard')
  }

  const ordersResult = await getCustomerOrders()

  if (!ordersResult.success) {
    return (
      <div className="container py-10">
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

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">{t('noOrders')}</p>
          <Button asChild>
            <Link href="/products">{t('startShopping')}</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.paymentMethod === 'CASH_ON_DELIVERY'
                      ? t('cashOnDelivery')
                      : t('creditCard')}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
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

              {/* View Details Button */}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/orders/${order.id}`}>{t('viewDetails')}</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
