'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { farmerProfileSchema, type FarmerProfileFormData } from '@/lib/validations/farmer'
import { createFarmerProfile } from '@/lib/actions/farmer'
import { toast } from 'sonner'

export function FarmerProfileForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FarmerProfileFormData>({
        resolver: zodResolver(farmerProfileSchema),
        defaultValues: {
            farmName: '',
            description: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
            latitude: 0,
            longitude: 0,
            phone: '',
            website: '',
        },
    })

    const onSubmit = async (data: FarmerProfileFormData) => {
        setIsLoading(true)

        try {
            const result = await createFarmerProfile(data)

            if (!result.success) {
                toast.error(result.error || 'Failed to create profile')
                return
            }

            toast.success('Profile created successfully!')
            router.push('/farmer/products')
            router.refresh()
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Simple geocoding helper (for demo - you can use a real API later)
    const handleAddressBlur = async () => {
        const address = form.getValues('address')
        const city = form.getValues('city')

        if (address && city) {
            // For now, set default coordinates (you can integrate Google Maps API later)
            form.setValue('latitude', 40.7128) // Default to NYC for demo
            form.setValue('longitude', -74.0060)
            toast.info('📍 Using default location. You can update coordinates manually.')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Your Farm Profile</CardTitle>
                <CardDescription>
                    Tell customers about your farm and products
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="farmName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Farm Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Green Valley Farm"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tell customers about your farm..."
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123 Farm Road"
                                            disabled={isLoading}
                                            {...field}
                                            onBlur={handleAddressBlur}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Springfield"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="IL"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zip Code (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="62701"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="+1 (555) 123-4567"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://yourfarm.com"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="40.7128"
                                                disabled={isLoading}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Auto-filled from address
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="-74.0060"
                                                disabled={isLoading}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Auto-filled from address
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Creating Profile...' : 'Create Profile'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}