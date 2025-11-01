import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductById } from '@/lib/db/products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ locale: string; id: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const paramsData = await params
    const product = await getProductById(paramsData.id)

    if (!product) {
        return {
            title: 'Product Not Found',
        }
    }

    return {
        title: `${product.name} - LocalRoots`,
        description: product.description || `Buy ${product.name} from local farmers`,
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const paramsData = await params
    const product = await getProductById(paramsData.id)

    if (!product) {
        notFound()
    }

    const farmer = product.farmer
    const profile = farmer.farmerProfile

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
                    <Link href="/products" className="hover:text-slate-900">
                        Products
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900">{product.name}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                <svg
                                    className="h-24 w-24"
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
                        {!product.inStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Badge variant="destructive" className="text-lg px-4 py-2">
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="flex-1 space-y-6">
                            {/* Header */}
                            <div>
                                <Badge className="mb-2">{product.category}</Badge>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                                    <span className="text-xl text-slate-500">/ {product.unit}</span>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div>
                                    <h2 className="mb-2 text-lg font-semibold">Description</h2>
                                    <p className="text-slate-700">{product.description}</p>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {product.inStock ? (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm text-slate-600">In Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-sm text-slate-600">Out of Stock</span>
                                    </>
                                )}
                            </div>

                            {/* Contact Button */}
                            <div className="pt-4">
                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={!product.inStock}
                                    asChild={product.inStock}
                                >
                                    {product.inStock ? (
                                        <a href={`mailto:${farmer.email}?subject=Interest in ${product.name}`}>
                                            <svg
                                                className="mr-2 h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            Contact Farmer
                                        </a>
                                    ) : (
                                        'Out of Stock'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Farmer Info Card */}
                        {profile && (
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle className="text-lg">About the Farmer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={farmer.image || undefined} />
                                            <AvatarFallback className="bg-green-600 text-white">
                                                {farmer.name?.charAt(0).toUpperCase() || 'F'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{profile.farmName}</h3>
                                            <p className="text-sm text-slate-600">by {farmer.name}</p>
                                            {profile.description && (
                                                <p className="mt-2 text-sm text-slate-700">
                                                    {profile.description}
                                                </p>
                                            )}
                                            <div className="mt-3 space-y-1 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    <span>
                            {profile.city}, {profile.state}
                          </span>
                                                </div>
                                                {profile.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                            />
                                                        </svg>
                                                        <a href={`tel:${profile.phone}`} className="hover:text-slate-900">
                                                            {profile.phone}
                                                        </a>
                                                    </div>
                                                )}
                                                {profile.website && (
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                                            />
                                                        </svg>
                                                        <a
                                                            href={profile.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-slate-900"
                                                        >
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* More from this farmer */}
                <MoreFromFarmer farmerId={product.farmerId} currentProductId={product.id} />
            </div>
        </div>
    )
}

// Component to show more products from same farmer
async function MoreFromFarmer({
                                  farmerId,
                                  currentProductId,
                              }: {
    farmerId: string
    currentProductId: string
}) {
    const prisma = (await import('@/lib/db/prisma')).default
    const { ProductCard } = await import('@/components/products/product-card')

    const otherProducts = await prisma.product.findMany({
        where: {
            farmerId,
            id: { not: currentProductId },
        },
        include: {
            farmer: {
                select: {
                    name: true,
                    farmerProfile: {
                        select: {
                            farmName: true,
                            city: true,
                            state: true,
                        },
                    },
                },
            },
        },
        take: 4,
    })

    if (otherProducts.length === 0) return null

    return (
        <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">More from this farmer</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {otherProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        unit={product.unit}
                        category={product.category}
                        imageUrl={product.imageUrl}
                        inStock={product.inStock}
                        farmerName={product.farmer.name}
                        farmName={product.farmer.farmerProfile?.farmName}
                        city={product.farmer.farmerProfile?.city}
                        state={product.farmer.farmerProfile?.state}
                    />
                ))}
            </div>
        </div>
    )
}