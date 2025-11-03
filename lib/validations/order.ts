import { z } from 'zod';

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  deliveryAddress: z.string().min(10, 'Please provide a complete delivery address'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'STRIPE']),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
