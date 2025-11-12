import { requireFarmer } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { FarmerProfileForm } from '@/components/farmer/farmer-profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { format } from 'date-fns'

async function getFarmerProfile(userId: string) {
    return await prisma.farmerProfile.findUnique({
        where: { userId }
    })
}

async function getFarmerStats(userId: string) {
    const [totalProducts, inStockProducts, totalOrders, pendingOrders] = await Promise.all([
        prisma.product.count({ where: { farmerId: userId } }),
        prisma.product.count({ where: { farmerId: userId, inStock: true } }),
        prisma.order.count({
            where: {
                items: {
                    some: {
                        product: { farmerId: userId }
                    }
                }
            }
        }),
        prisma.order.count({
            where: {
                status: 'PENDING',
                items: {
                    some: {
                        product: { farmerId: userId }
                    }
                }
            }
        })
    ])

    // Calculate total revenue manually
    const orderItems = await prisma.orderItem.findMany({
        where: {
            product: { farmerId: userId },
            order: { status: { in: ['COMPLETED', 'CONFIRMED'] } }
        },
        select: {
            quantity: true,
            priceAtPurchase: true
        }
    })

    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0)

    return {
        totalProducts,
        inStockProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
    }
}

async function getRecentOrders(userId: string) {
    const orders = await prisma.order.findMany({
        where: {
            items: {
                some: {
                    product: { farmerId: userId }
                }
            }
        },
        select: {
            id: true,
            status: true,
            createdAt: true,
            customerName: true,
            customerEmail: true,
            items: {
                where: {
                    product: { farmerId: userId }
                },
                select: {
                    quantity: true,
                    priceAtPurchase: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            unit: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    return orders
}

async function getSalesData(userId: string) {
    // Get last 7 days of sales
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: sevenDaysAgo },
            items: {
                some: {
                    product: { farmerId: userId }
                }
            }
        },
        include: {
            items: {
                where: {
                    product: { farmerId: userId }
                },
                select: {
                    quantity: true,
                    priceAtPurchase: true
                }
            }
        }
    })

    // Group by day
    const salesByDay = new Map<string, number>()
    orders.forEach(order => {
        const day = format(order.createdAt, 'EEE')
        const total = order.items.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0)
        salesByDay.set(day, (salesByDay.get(day) || 0) + total)
    })

    // Create chart data for last 7 days
    const chartData = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const day = format(date, 'EEE')
        chartData.push({
            day,
            sales: salesByDay.get(day) || 0
        })
    }

    return chartData
}

export default async function FarmerDashboardPage() {
    const user = await requireFarmer()
    const profile = await getFarmerProfile(user.id)
    const t = await getTranslations('farmer.dashboard')

    // If no profile, show setup form
    if (!profile) {
        return (
            <div className="mx-auto max-w-3xl px-4 lg:px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">{t('welcome', { name: user.name ?? 'Farmer' })}</h1>
                    <p className="mt-2 text-slate-600">
                        {t('setupProfile')}
                    </p>
                </div>
                <FarmerProfileForm />
            </div>
        )
    }

    const stats = await getFarmerStats(user.id)
    const recentOrders = await getRecentOrders(user.id)
    const salesData = await getSalesData(user.id)

    return (
        <div className="px-4 lg:px-6 py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-slate-600">{t('welcomeBack', { name: user.name ?? 'Farmer' })}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalProducts')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">{stats.inStockProducts} {t('stats.inStockCount')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalOrders')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">{stats.pendingOrders} {t('stats.pendingCount')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{t('stats.fromCompleted')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.stockStatus')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalProducts > 0 ? Math.round((stats.inStockProducts / stats.totalProducts) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">{t('stats.productsAvailable')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Chart */}
            <div className="mb-8">
                <SalesChart data={salesData} />
            </div>

            {/* Recent Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('recentOrders.title')}</CardTitle>
                    <CardDescription>{t('recentOrders.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('recentOrders.noOrders')}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('recentOrders.table.product')}</TableHead>
                                    <TableHead>{t('recentOrders.table.customer')}</TableHead>
                                    <TableHead>{t('recentOrders.table.quantity')}</TableHead>
                                    <TableHead>{t('recentOrders.table.total')}</TableHead>
                                    <TableHead>{t('recentOrders.table.status')}</TableHead>
                                    <TableHead>{t('recentOrders.table.date')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    order.items.map((item, idx) => (
                                        <TableRow key={`${order.id}-${idx}`}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    {item.product.imageUrl ? (
                                                        <Image
                                                            src={item.product.imageUrl}
                                                            alt={item.product.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-xs">
                                                            {t('recentOrders.table.noImage')}
                                                        </div>
                                                    )}
                                                    <span>{item.product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{item.quantity} {item.product.unit}</TableCell>
                                            <TableCell>${(item.quantity * item.priceAtPurchase).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    order.status === 'COMPLETED' ? 'default' :
                                                    order.status === 'PENDING' ? 'secondary' :
                                                    order.status === 'CONFIRMED' ? 'outline' : 'destructive'
                                                }>
                                                    {order.status.toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(order.createdAt, 'MMM dd, yyyy')}</TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
