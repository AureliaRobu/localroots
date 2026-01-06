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
import { CountryDropdown } from '@/components/ui/country-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { farmerProfileSchema, type FarmerProfileFormData } from '@/lib/validations/farmer'
import { createFarmerProfile } from '@/lib/actions/farmer'
import { geocodeAddress } from '@/lib/actions/geocoding'
import { toast } from 'sonner'

export function FarmerProfileForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isGeocoding, setIsGeocoding] = useState(false)

    const form = useForm<FarmerProfileFormData>({
        resolver: zodResolver(farmerProfileSchema),
        defaultValues: {
            farmName: '',
            description: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US',
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
            router.push('/dashboard/selling/products')
            router.refresh()
        } catch  {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-geocode address
    const handleGeocode = async () => {
        const address = form.getValues('address')
        const city = form.getValues('city')
        const state = form.getValues('state')
        const country = form.getValues('country')

        if (!address || !city) {
            toast.error('Please enter address and city first')
            return
        }

        setIsGeocoding(true)
        toast.info('Finding location...')

        try {
            // Pass individual components - let geocodeAddress build the query
            const result = await geocodeAddress(address, city, state, country)

            if (result.success && result.latitude && result.longitude) {
                form.setValue('latitude', result.latitude)
                form.setValue('longitude', result.longitude)
                toast.success('Location found!')

                // Optional: log the display name for verification
                if (result.displayName) {
                    console.log('Found location:', result.displayName)
                }
            } else {
                toast.error(result.error || 'Could not find location')
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            toast.error('Geocoding failed')
        } finally {
            setIsGeocoding(false)
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
                                        <FormLabel>State/Province (Optional)</FormLabel>
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
                                        <FormLabel>Zip/Postal Code (Optional)</FormLabel>
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
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <CountryDropdown
                                                placeholder="Country"
                                                defaultValue={field.value}
                                                onChange={(country) => {
                                                    field.onChange(country.alpha3);
                                                }}
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
                        </div>

                        {/* Geocoding Section */}
                        <div className="rounded-lg border bg-slate-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-medium">Location Coordinates</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGeocode}
                                    disabled={isGeocoding || isLoading}
                                >
                                    {isGeocoding ? 'Finding...' : '📍 Auto-fill Location'}
                                </Button>
                            </div>

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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormDescription className="mt-2 text-xs">
                                Click &#34;Auto-fill Location&#34; after entering your complete address
                            </FormDescription>
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