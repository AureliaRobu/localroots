
import { requireFarmer } from '@/lib/auth/session'
import prisma from '@/lib/db/prisma'
import { FarmerProfileForm } from '@/components/farmer/farmer-profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getFarmerProfile(userId: string) {
    return await prisma.farmerProfile.findUnique({
        where: { userId }
    })
}

export default async function FarmerDashboardPage() {
    const user = await requireFarmer()
    const profile = await getFarmerProfile(user.id)

    // If no profile, show setup form
    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-3xl px-4 py-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
                        <p className="mt-2 text-slate-600">
                            Let&#39;s set up your farmer profile to start selling
                        </p>
                    </div>
                    <FarmerProfileForm />
                </div>
            </div>
        )
    }

    // Show dashboard with profile info
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-slate-600">Welcome back, {user.name}!</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Farm Profile</CardTitle>
                            <CardDescription>{profile.farmName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-600">
                                    {profile.city}, {profile.state}
                                </p>
                                {profile.phone && <p>📞 {profile.phone}</p>}
                                {profile.website && (
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        🌐 Visit Website
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/farmer/products" className="block">
                                <Button className="w-full">Manage Products</Button>
                            </Link>
                            <Link href="/products" className="block">
                                <Button variant="outline" className="w-full">
                                    View Marketplace
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Products</span>
                                    <span className="font-semibold">
                    {await prisma.product.count({ where: { farmerId: user.id } })}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">In Stock</span>
                                    <span className="font-semibold">
                    {await prisma.product.count({
                        where: { farmerId: user.id, inStock: true }
                    })}
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}