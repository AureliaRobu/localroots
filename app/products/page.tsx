import { Suspense } from 'react'
import Link from 'next/link'
import { getProducts, getProductCategories } from '@/lib/db/products'
import { ProductCard } from '@/components/products/product-card'
import { ProductsFilters } from '@/components/products/products-filters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
    searchParams: Promise<{
        search?: string
        category?: string
        inStock?: string
    }>
}

async function ProductsList({ searchParams }: Props) {
    const params = await searchParams

    const filters = {
        search: params.search,
        category: params.category,
        inStock: params.inStock === 'true' ? true : params.inStock === 'false' ? false : undefined,
    }

    const products = await getProducts(filters)

    if (products.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                    <h3 className="text-xl font-semibold">No products found</h3>
                    <p className="text-sm text-slate-600">
                        Try adjusting your filters or search terms
                    </p>
                    <Link href="/products" className="mt-4">
                        <Button variant="outline">Clear Filters</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-4 text-sm text-slate-600">
                Found {products.length} product{products.length !== 1 ? 's' : ''}
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
                        farmName={product.farmer.farmerProfile?.farmName}
                        city={product.farmer.farmerProfile?.city}
                        state={product.farmer.farmerProfile?.state}
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

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Browse Local Products
                        </h1>
                        <p className="mt-1 text-slate-600">
                            Fresh, organic products from local farmers
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/map">
                            <Button variant="outline">
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
                                Map View
                            </Button>
                        </Link>
                    </div>
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