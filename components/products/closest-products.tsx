'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductCardCompact } from '@/components/products/product-card-compact'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { useTranslations } from 'next-intl'
import { getClosestProductsAction } from '@/lib/actions/products'
import { cn } from '@/lib/utils'

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    unit: string
    category: string
    imageUrl: string | null
    inStock: boolean
    distance: number
    farmer: {
        name: string | null
        farmerProfile: {
            farmName: string
            city: string
            state: string | null
        } | null
    }
}

type ClosestProductsProps = {
    initialProducts?: Product[]
}

export function ClosestProducts({ initialProducts = [] }: ClosestProductsProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [loading, setLoading] = useState(initialProducts.length === 0)
    const [error, setError] = useState<string | null>(null)
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const t = useTranslations('customer.dashboard.closestProducts')

    useEffect(() => {
        if (initialProducts.length > 0) return

        // Get user's location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const result = await getClosestProductsAction(
                            position.coords.latitude,
                            position.coords.longitude
                        )

                        if (result.success && result.data) {
                            setProducts(result.data)
                        } else {
                            setError(result.error || t('errorFetching'))
                        }
                        setLoading(false)
                    } catch (err) {
                        setError(t('errorFetching'))
                        setLoading(false)
                    }
                },
                (err) => {
                    setError(t('locationError'))
                    setLoading(false)
                }
            )
        } else {
            setError(t('locationNotSupported'))
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialProducts.length])

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (products.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>{t('noProducts')}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <ProductCardCompact
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    unit={product.unit}
                                    category={product.category}
                                    imageUrl={product.imageUrl}
                                    inStock={product.inStock}
                                    farmerName={product.farmer.name}
                                    farmName={product.farmer.farmerProfile?.farmName}
                                    distance={product.distance}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all",
                                current === index
                                    ? "bg-green-600 w-6"
                                    : "bg-slate-300 hover:bg-slate-400"
                            )}
                            onClick={() => api?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
