import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Filters & Products Grid */}
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Sidebar Skeleton */}
                    <aside className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </aside>

                    {/* Products Grid Skeleton */}
                    <div className="lg:col-span-3">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="aspect-square w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
