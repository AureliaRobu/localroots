import prisma from '@/lib/db/prisma'
import { MapWrapper } from '@/components/maps/map-wrapper'

async function getFarmersLocations() {
    const farmers = await prisma.farmerProfile.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    products: {
                        where: { inStock: true },
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            unit: true,
                            category: true,
                        },
                    },
                },
            },
        },
    })

    return farmers.map((farmer) => ({
        id: farmer.userId,
        farmName: farmer.farmName,
        farmerName: farmer.user.name || 'Unknown',
        city: farmer.city,
        state: farmer.state || '',
        latitude: farmer.latitude,
        longitude: farmer.longitude,
        productCount: farmer.user.products.length,
        products: farmer.user.products,
    }))
}

export default async function MapPage() {
    const farmers = await getFarmersLocations()

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            {/* Header */}
            <div className="border-b bg-white px-4 py-4">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-2xl font-bold">Farmers Map</h1>
                    <p className="text-sm text-slate-600">
                        Discover {farmers.length} local farmer{farmers.length !== 1 ? 's' : ''} near you
                    </p>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1">
                <MapWrapper farmers={farmers} />
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Farmers Map - LocalRoots',
    description: 'Find local organic farmers on an interactive map',
}