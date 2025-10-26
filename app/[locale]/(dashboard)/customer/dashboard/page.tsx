import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import prisma from '@/lib/db/prisma'
import { UserRole } from '@prisma/client'

async function getCustomerStats(userId: string) {
    // Get total number of farmers
    const farmersCount = await prisma.farmerProfile.count()

    // Get total number of products
    const productsCount = await prisma.product.count({
        where: { inStock: true }
    })

    // Get product categories
    const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
    })

    return {
        farmersCount,
        productsCount,
        categoriesCount: categories.length,
    }
}

async function getRecentProducts() {
    return await prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
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
    })
}

export default async function CustomerDashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    if (user.role !== UserRole.CUSTOMER) {
        redirect('/farmer/dashboard')
    }

    const stats = await getCustomerStats(user.id)
    const recentProducts = await getRecentProducts()

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
                    <p className="text-slate-600">Discover fresh, local products</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Local Farmers
                            </CardTitle>
                            <svg
                                className="h-4 w-4 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.farmersCount}</div>
                            <p className="text-xs text-slate-500">
                                Active farmers in your area
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available Products
                            </CardTitle>
                            <svg
                                className="h-4 w-4 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.productsCount}</div>
                            <p className="text-xs text-slate-500">
                                Fresh products in stock
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Categories
                            </CardTitle>
                            <svg
                                className="h-4 w-4 text-slate-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
                            <p className="text-xs text-slate-500">
                                Product categories
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Explore local products and farmers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Link href="/products">
                                <Button className="w-full" size="lg">
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Browse Products
                                </Button>
                            </Link>
                            <Link href="/map">
                                <Button variant="outline" className="w-full" size="lg">
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
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                        />
                                    </svg>
                                    View Map
                                </Button>
                            </Link>
                            <Link href="/products?category=Vegetables">
                                <Button variant="outline" className="w-full" size="lg">
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
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                    Browse Categories
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recently Added Products */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Recently Added</h2>
                        <Link href="/products">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>

                    {recentProducts.length === 0 ? (
                        <Card>
                            <CardContent className="flex min-h-[200px] items-center justify-center">
                                <p className="text-slate-600">No products available yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recentProducts.map((product) => (
                                <Link key={product.id} href={`/app/%5Blocale%5D/products/${product.id}`}>
                                    <Card className="group transition-shadow hover:shadow-lg">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="line-clamp-1 text-lg group-hover:text-green-600">
                                                        {product.name}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {product.farmer.farmerProfile?.farmName || product.farmer.name}
                                                    </CardDescription>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-600">
                                                        ${product.price.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        per {product.unit}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                          {product.category}
                        </span>
                                                <span>
                          {product.farmer.farmerProfile?.city}, {product.farmer.farmerProfile?.state}
                        </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}