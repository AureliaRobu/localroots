import { Suspense } from 'react'
import Link from 'next/link'
import { getProducts, getProductCategories } from '@/lib/db/products'
import { ProductCard } from '@/components/products/product-card'
import { ProductsFilters } from '@/components/products/products-filters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getTranslations } from 'next-intl/server'

type Props = {
    searchParams: Promise<{
        search?: string
        category?: string
        inStock?: string
        maxDistance?: string
        userLat?: string
        userLon?: string
    }>
}

async function ProductsList({ searchParams }: Props) {
    const params = await searchParams
    const t = await getTranslations('products')

    // Helper function to create query string
    const createQueryString = (params: Record<string, string | undefined>) => {
        const validParams = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, String(value)])
        return new URLSearchParams(validParams).toString()
    }

    const filters = {
        search: params.search,
        category: params.category,
        inStock: params.inStock === 'true' ? true : params.inStock === 'false' ? false : undefined,
        maxDistance: params.maxDistance ? parseFloat(params.maxDistance) : undefined,
        userLat: params.userLat ? parseFloat(params.userLat) : undefined,
        userLon: params.userLon ? parseFloat(params.userLon) : undefined,
    }

    const products = await getProducts(filters)

    if (products.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                    <h3 className="text-xl font-semibold">{t('noProducts')}</h3>
                    <p className="text-sm text-slate-600">
                        {t('noProductsDescription')}
                    </p>
                    <Link href="/products" className="mt-4">
                        <Button variant="outline">{t('clearFilters')}</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                    {t('found')} {products.length} {products.length !== 1 ? t('products') : t('product')}
                </div>
                <Link href={`/map?${createQueryString(params)}`}>
                    <Button variant="outline" size="sm">
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        {t('viewOnMap')}
                    </Button>
                </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
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
                        farmName={product.farmer.sellerProfile?.farmName}
                        city={product.farmer.sellerProfile?.city}
                        state={product.farmer.sellerProfile?.state}
                        averageRating={product.averageRating}
                        reviewCount={product.reviewCount}
                    />
                ))}
            </div>
        </>
    )
}

function ProductsLoading() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    )
}

export default async function ProductsPage({ searchParams }: Props) {
    const categories = await getProductCategories()
    const t = await getTranslations('products')

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="mt-1 text-slate-600">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Filters & Products Grid */}
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1">
                        <ProductsFilters categories={categories} />
                    </aside>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        <Suspense fallback={<ProductsLoading />}>
                            <ProductsList searchParams={searchParams} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    )
}