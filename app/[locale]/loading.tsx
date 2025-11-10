export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="mx-auto max-w-7xl px-4 py-20 text-center">
                <div className="h-12 w-3/4 mx-auto bg-slate-200 rounded-lg animate-pulse mb-6" />
                <div className="h-6 w-1/2 mx-auto bg-slate-200 rounded-lg animate-pulse mb-10" />
                <div className="flex items-center justify-center gap-4">
                    <div className="h-12 w-40 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-12 w-40 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    )
}
