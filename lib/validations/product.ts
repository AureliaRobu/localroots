import * as z from 'zod'

export const productSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be greater than 0'),
    unit: z.string().min(1, 'Unit is required'),
    category: z.string().min(1, 'Category is required'),
    imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    inStock: z.boolean()
})

export type ProductFormData = z.infer<typeof productSchema>