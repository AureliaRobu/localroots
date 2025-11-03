'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutFormSchema, type CheckoutFormData } from '@/lib/validations/order'
import { createOrder } from '@/lib/actions/order'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

interface CheckoutFormProps {
  defaultName: string
  defaultEmail: string
  total: number
}

export function CheckoutForm({ defaultName, defaultEmail, total }: CheckoutFormProps) {
  const router = useRouter()
  const t = useTranslations('Checkout')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: defaultName,
      customerEmail: defaultEmail,
      customerPhone: '',
      deliveryAddress: '',
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: '',
    },
  })

  const paymentMethod = watch('paymentMethod')

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)

    try {
      const result = await createOrder(data)

      if (result.success && result.data) {
        toast.success(t('orderCreated'))
        router.push(`/orders/${result.data.id}`)
      } else {
        toast.error(result.error || t('orderFailed'))
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(t('orderFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customerName">{t('name')}</Label>
        <Input
          id="customerName"
          {...register('customerName')}
          placeholder={t('namePlaceholder')}
        />
        {errors.customerName && (
          <p className="text-sm text-red-500">{errors.customerName.message}</p>
        )}
      </div>

      {/* Customer Email */}
      <div className="space-y-2">
        <Label htmlFor="customerEmail">{t('email')}</Label>
        <Input
          id="customerEmail"
          type="email"
          {...register('customerEmail')}
          placeholder={t('emailPlaceholder')}
        />
        {errors.customerEmail && (
          <p className="text-sm text-red-500">{errors.customerEmail.message}</p>
        )}
      </div>

      {/* Customer Phone */}
      <div className="space-y-2">
        <Label htmlFor="customerPhone">{t('phone')}</Label>
        <Input
          id="customerPhone"
          type="tel"
          {...register('customerPhone')}
          placeholder={t('phonePlaceholder')}
        />
        {errors.customerPhone && (
          <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
        )}
      </div>

      {/* Delivery Address */}
      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">{t('address')}</Label>
        <Input
          id="deliveryAddress"
          {...register('deliveryAddress')}
          placeholder={t('addressPlaceholder')}
        />
        {errors.deliveryAddress && (
          <p className="text-sm text-red-500">{errors.deliveryAddress.message}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>{t('paymentMethod')}</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setValue('paymentMethod', value as 'CASH_ON_DELIVERY' | 'STRIPE')}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 border rounded-lg p-4">
            <RadioGroupItem value="CASH_ON_DELIVERY" id="cash" />
            <div className="flex-1">
              <Label htmlFor="cash" className="cursor-pointer">
                <div className="font-medium">{t('cashOnDelivery')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('cashOnDeliveryDescription')}
                </div>
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2 border rounded-lg p-4 opacity-50">
            <RadioGroupItem value="STRIPE" id="stripe" disabled />
            <div className="flex-1">
              <Label htmlFor="stripe" className="cursor-not-allowed">
                <div className="font-medium">{t('creditCard')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('comingSoon')}
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Input
          id="notes"
          {...register('notes')}
          placeholder={t('notesPlaceholder')}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t('processing') : `${t('placeOrder')} - $${total.toFixed(2)}`}
      </Button>
    </form>
  )
}
