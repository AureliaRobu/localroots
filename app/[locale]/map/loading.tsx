export default function MapLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            {/* Header Skeleton */}
            <div className="border-b bg-white px-4 py-4">
                <div className="mx-auto max-w-7xl">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
                    <div className="h-5 w-64 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Map Skeleton */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading map...</p>
                </div>
            </div>
        </div>
    )
}
