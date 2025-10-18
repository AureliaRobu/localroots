'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FarmerLocation = {
    id: string
    farmName: string
    farmerName: string
    city: string
    state: string
    latitude: number
    longitude: number
    productCount: number
    products: Array<{
        id: string
        name: string
        price: number
        unit: string
        category: string
    }>
}

type Props = {
    farmers: FarmerLocation[]
}

// Custom green icon for farmers
const farmerIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
})

// Component to fit map bounds to all markers
function FitBounds({ farmers }: { farmers: FarmerLocation[] }) {
    const map = useMap()

    useEffect(() => {
        if (farmers.length > 0) {
            const bounds = farmers.map((f) => [f.latitude, f.longitude] as [number, number])
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [farmers, map])

    return null
}

export function FarmersMap({ farmers }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    // Only render map on client side
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-100">
                <p className="text-slate-600">Loading map...</p>
            </div>
        )
    }

    if (farmers.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-100">
                <p className="text-slate-600">No farmers to display on map</p>
            </div>
        )
    }

    // Default center (will be adjusted by FitBounds)
    const center: [number, number] = [39.8283, -98.5795] // Center of USA

    return (
        <MapContainer
            center={center}
            zoom={4}
            className="h-full w-full"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds farmers={farmers} />

            {farmers.map((farmer) => (
                <Marker
                    key={farmer.id}
                    position={[farmer.latitude, farmer.longitude]}
                    icon={farmerIcon}
                >
                    <Popup maxWidth={300}>
                        <div className="p-2">
                            <h3 className="mb-1 text-lg font-semibold">{farmer.farmName}</h3>
                            <p className="mb-2 text-sm text-slate-600">
                                by {farmer.farmerName}
                            </p>
                            <p className="mb-3 text-sm text-slate-600">
                                📍 {farmer.city}, {farmer.state}
                            </p>

                            <div className="mb-3">
                                <p className="mb-2 text-sm font-medium">
                                    {farmer.productCount} Product{farmer.productCount !== 1 ? 's' : ''} Available
                                </p>
                                <div className="space-y-1">
                                    {farmer.products.slice(0, 3).map((product) => (
                                        <div key={product.id} className="flex items-center justify-between text-sm">
                                            <span className="truncate">{product.name}</span>
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                ${product.price.toFixed(2)}/{product.unit}
                                            </Badge>
                                        </div>
                                    ))}
                                    {farmer.products.length > 3 && (
                                        <p className="text-xs text-slate-500">
                                            +{farmer.products.length - 3} more
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Link href={`/products`}>
                                <Button size="sm" className="w-full">
                                    View Products
                                </Button>
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}