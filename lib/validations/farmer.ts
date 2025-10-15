import * as z from 'zod'

export const farmerProfileSchema = z.object({
    farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
    description: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    phone: z.string().optional(),
    website: z.url('Invalid URL').optional().or(z.literal('')),
})

export type FarmerProfileFormData = z.infer<typeof farmerProfileSchema>