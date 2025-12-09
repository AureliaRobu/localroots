'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

type ProductCardCompactProps = {
    id: string
    name: string
    price: number
    unit: string
    category: string
    imageUrl?: string | null
    inStock: boolean
    farmerName?: string | null
    farmName?: string | null
    distance?: number
}

export function ProductCardCompact({
    id,
    name,
    price,
    unit,
    category,
    imageUrl,
    inStock,
    farmerName,
    farmName,
    distance,
}: ProductCardCompactProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg h-full">
            <Link href={`/products/${id}`}>
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 20vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                            <svg
                                className="h-12 w-12"
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
                            <Badge variant="destructive" className="text-xs">
                                Out of Stock
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>
            <CardContent className="p-3 space-y-2">
                <Link href={`/products/${id}`}>
                    <h3 className="font-semibold text-sm line-clamp-1 hover:underline">{name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-base font-bold text-green-600">
                            ${price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">per {unit}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {category}
                    </Badge>
                </div>
                <div className="text-xs text-slate-600">
                    <div className="font-medium truncate">{farmName || farmerName}</div>
                    {distance !== undefined && (
                        <div className="text-slate-500">
                            {distance < 1 
                                ? `${(distance * 1000).toFixed(0)}m away`
                                : `${distance.toFixed(1)}km away`
                            }
                        </div>
                    )}
                </div>
                <AddToCartButton
                    productId={id}
                    inStock={inStock}
                    variant="icon"
                    className="w-full"
                />
            </CardContent>
        </Card>
    )
}
