
'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

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

const FarmersMap = dynamic(
    () => import('./farmers-map').then((mod) => mod.FarmersMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center bg-slate-100">
                <Skeleton className="h-full w-full" />
            </div>
        ),
    }
)

export function MapWrapper({ farmers }: Props) {
    return <FarmersMap farmers={farmers} />
}