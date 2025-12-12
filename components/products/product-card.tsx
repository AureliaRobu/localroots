'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { StarRating } from '@/components/reviews/star-rating'

type ProductCardProps = {
    id: string
    name: string
    description?: string | null
    price: number
    unit: string
    category: string
    imageUrl?: string | null
    inStock: boolean
    farmerName?: string | null
    farmName?: string | null
    city?: string | null
    state?: string | null
    averageRating?: number | null
    reviewCount?: number
}

export function ProductCard({
                                id,
                                name,
                                description,
                                price,
                                unit,
                                category,
                                imageUrl,
                                inStock,
                                farmerName,
                                farmName,
                                city,
                                state,
                                averageRating,
                                reviewCount = 0,
                            }: ProductCardProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg flex flex-col">
                <Link href={`/products/${id}`} className="cursor-pointer">
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                <svg
                                    className="h-16 w-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                        {!inStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Badge variant="destructive" className="text-sm">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                    </div>
                </Link>
                <Link href={`/products/${id}`} className="cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                                <h3 className="line-clamp-1 font-semibold">{name}</h3>
                                <p className="line-clamp-2 text-sm text-slate-600">
                                    {description || 'No description available'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                    ${price.toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-500">per {unit}</div>
                            </div>
                        </div>
                        {averageRating && reviewCount > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                                <StarRating rating={averageRating} size="sm" />
                                <span className="text-xs text-slate-600">
                                    ({reviewCount})
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Link>
                <CardFooter className="border-t bg-slate-50 p-3 flex-col gap-3">
                    <div className="flex w-full items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">{farmName || farmerName}</div>
                            {city && state && (
                                <div className="text-slate-500">
                                    {city}, {state}
                                </div>
                            )}
                        </div>
                    </div>
                    <AddToCartButton
                        productId={id}
                        inStock={inStock}
                        variant="icon"
                        className="w-full"
                    />
                </CardFooter>
            </Card>
    )
}