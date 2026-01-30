import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
    return (
        <div className="px-4 lg:px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Skeleton className="h-9 w-40 mb-2" />
                    <Skeleton className="h-5 w-56" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-48 w-full rounded-t-lg" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
