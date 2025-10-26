import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProductNotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-900">404</h1>
                <h2 className="mt-4 text-2xl font-semibold text-slate-700">
                    Product Not Found
                </h2>
                <p className="mt-2 text-slate-600">
                    The product you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                    <Link href="/public">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}