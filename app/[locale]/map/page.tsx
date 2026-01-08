import prisma from '@/lib/db/prisma'
import { MapWrapper } from '@/components/maps/map-wrapper'
import { getProducts } from '@/lib/db/products'
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'

type Props = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{
        search?: string
        category?: string
        inStock?: string
        maxDistance?: string
        userLat?: string
        userLon?: string
    }>
}

const seoContent = {
    en: {
        title: 'Find Local Farmers Near You - Interactive Map',
        description: 'Use our interactive map to discover organic farmers in your area. Find fresh, local produce and connect with farmers near you.',
    },
    fr: {
        title: 'Trouvez des Agriculteurs Locaux - Carte Interactive',
        description: 'Utilisez notre carte interactive pour découvrir les agriculteurs bio près de chez vous.',
    },
    es: {
        title: 'Encuentra Agricultores Locales - Mapa Interactivo',
        description: 'Usa nuestro mapa interactivo para descubrir agricultores orgánicos en tu área.',
    },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    const content = seoContent[locale as keyof typeof seoContent] || seoContent.en

    return {
        title: content.title,
        description: content.description,
        openGraph: {
            title: content.title,
            description: content.description,
            url: `${baseUrl}/${locale}/map`,
            images: [{ url: `${baseUrl}/og-image`, width: 1200, height: 630 }],
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/map`,
        },
    }
}

async function getFarmersLocations(searchParams: Awaited<Props['searchParams']>) {
    // Get filtered products
    const filters = {
        search: searchParams.search,
        category: searchParams.category,
        inStock: searchParams.inStock === 'true' ? true : searchParams.inStock === 'false' ? false : undefined,
        maxDistance: searchParams.maxDistance ? parseFloat(searchParams.maxDistance) : undefined,
        userLat: searchParams.userLat ? parseFloat(searchParams.userLat) : undefined,
        userLon: searchParams.userLon ? parseFloat(searchParams.userLon) : undefined,
    }

    const filteredProducts = await getProducts(filters)

    // Get unique farmer IDs from filtered products
    const farmerIds = [...new Set(filteredProducts.map(p => p.farmerId))]

    // Get seller profiles for those farmers
    const farmers = await prisma.sellerProfile.findMany({
        where: {
            userId: { in: farmerIds }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    products: {
                        where: {
                            inStock: true,
                            id: { in: filteredProducts.map(p => p.id) }
                        },
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

export default async function MapPage({ searchParams }: Props) {
    const params = await searchParams
    const farmers = await getFarmersLocations(params)

    const hasFilters = Object.keys(params).length > 0

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            {/* Header */}
            <div className="border-b bg-white px-4 py-4">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-2xl font-bold">Farmers Map</h1>
                    <p className="text-sm text-slate-600">
                        {hasFilters ? 'Filtered: ' : 'Showing '}
                        {farmers.length} local farmer{farmers.length !== 1 ? 's' : ''}
                        {hasFilters && ' matching your criteria'}
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

