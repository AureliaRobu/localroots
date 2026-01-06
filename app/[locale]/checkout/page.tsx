import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { getCart } from '@/lib/actions/cart'
import { getTranslations } from 'next-intl/server'
import { CheckoutForm } from './checkout-form'

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  const t = await getTranslations('Checkout')

  if (!user) {
    redirect('/login')
  }

  // Get user's cart
  const cartResult = await getCart()

  if (!cartResult.success || !cartResult.data) {
    redirect('/products')
  }

  const cart = cartResult.data

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    redirect('/products')
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity
  }, 0)

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Order Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('orderSummary')}</h2>

          <div className="border rounded-lg p-4 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.product.farmer?.sellerProfile?.farmName || item.product.farmer?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x ${item.product.price.toFixed(2)} / {item.product.unit}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>{t('total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('deliveryDetails')}</h2>
          <CheckoutForm
            defaultName={user.name || ''}
            defaultEmail={user.email || ''}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}
