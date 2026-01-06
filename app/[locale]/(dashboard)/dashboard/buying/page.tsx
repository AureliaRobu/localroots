import { requireAuth } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SpendingChart } from '@/components/dashboard/spending-chart'
import prisma from '@/lib/db/prisma'
import Image from 'next/image'
import { format } from 'date-fns'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

async function getCustomerStats(userId: string) {
    const [totalOrders, pendingOrders, completedOrders, totalSpent] = await Promise.all([
        prisma.order.count({ where: { userId: userId } }),
        prisma.order.count({ where: { userId: userId, status: 'PENDING' } }),
        prisma.order.count({ where: { userId: userId, status: 'COMPLETED' } }),
        prisma.order.aggregate({
            where: {
                userId: userId,
                status: { in: ['COMPLETED', 'CONFIRMED'] }
            },
            _sum: { total: true }
        })
    ])

    // Get favorite categories
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: { userId: userId }
        },
        include: {
            product: {
                select: { category: true }
            }
        }
    })

    const categoryCounts = orderItems.reduce((acc, item) => {
        acc[item.product.category] = (acc[item.product.category] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

    return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: totalSpent._sum.total || 0,
        favoriteCategory
    }
}

async function getRecentOrders(userId: string) {
    const orders = await prisma.order.findMany({
        where: { userId: userId },
        select: {
            id: true,
            status: true,
            createdAt: true,
            items: {
                select: {
                    quantity: true,
                    priceAtPurchase: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            unit: true,
                            farmer: {
                                select: {
                                    name: true,
                                    sellerProfile: {
                                        select: { farmName: true }
                                    }
                                }
                            }
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

async function getSpendingData(userId: string) {
    // Get last 7 days of spending
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orders = await prisma.order.findMany({
        where: {
            userId: userId,
            createdAt: { gte: sevenDaysAgo }
        },
        select: {
            createdAt: true,
            total: true
        }
    })

    // Group by day
    const spendingByDay = new Map<string, number>()
    orders.forEach(order => {
        const day = format(order.createdAt, 'EEE')
        spendingByDay.set(day, (spendingByDay.get(day) || 0) + order.total)
    })

    // Create chart data for last 7 days
    const chartData = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const day = format(date, 'EEE')
        chartData.push({
            day,
            spending: spendingByDay.get(day) || 0
        })
    }

    return chartData
}

export default async function BuyingDashboardPage() {
    const user = await requireAuth()
    const stats = await getCustomerStats(user.id)
    const recentOrders = await getRecentOrders(user.id)
    const spendingData = await getSpendingData(user.id)
    const t = await getTranslations('customer.dashboard')

    return (
        <div className="px-4 lg:px-6 py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('title', { name: user.name ?? 'there' })}</h1>
                <p className="text-slate-600">{t('subtitle')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalOrders')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">{stats.completedOrders} {t('stats.completedCount')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.pendingOrders')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">{t('stats.awaitingDelivery')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalSpent')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{t('stats.onLocalProducts')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.favoriteCategory')}</CardTitle>
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.favoriteCategory}</div>
                        <p className="text-xs text-muted-foreground">{t('stats.mostPurchased')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Spending Chart */}
            <div className="mb-8">
                <SpendingChart data={spendingData} />
            </div>

            {/* Recent Orders Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('recentOrders.title')}</CardTitle>
                            <CardDescription>{t('recentOrders.description')}</CardDescription>
                        </div>
                        <Link href="/dashboard/buying/orders">
                            <span className="text-sm text-green-600 hover:underline">{t('recentOrders.viewAll')}</span>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>{t('recentOrders.noOrders')}</p>
                            <Link href="/products">
                                <span className="text-sm text-green-600 hover:underline mt-2 inline-block">
                                    {t('recentOrders.startShopping')}
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('recentOrders.table.product')}</TableHead>
                                    <TableHead>{t('recentOrders.table.farmer')}</TableHead>
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
                                            <TableCell>
                                                {item.product.farmer.sellerProfile?.farmName || item.product.farmer.name}
                                            </TableCell>
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
