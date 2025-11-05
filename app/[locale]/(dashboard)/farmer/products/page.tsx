import { requireFarmer } from '@/lib/auth/session'
import { AddProductForm } from '@/components/products/add-product-form'
import { FarmerProductsGrid } from '@/components/products/farmer-products-grid'
import prisma from '@/lib/db/prisma'

async function getFarmerProducts(userId: string) {
    const products = await prisma.product.findMany({
        where: { farmerId: userId },
        orderBy: { createdAt: 'desc' },
    })
    return products
}

export default async function FarmerProductsPage() {
    const user = await requireFarmer()
    const products = await getFarmerProducts(user.id)

    return (
        <div className="px-4 lg:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Products</h1>
                <p className="text-slate-600">Manage your product listings</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <AddProductForm />
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="mb-4 text-xl font-semibold">Your Products</h2>
                        {products.length === 0 ? (
                            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed p-8">
                                <p className="text-slate-600">
                                    No products yet. Add your first product!
                                </p>
                            </div>
                        ) : (
                            <FarmerProductsGrid products={products} />
                        )}
                    </div>
            </div>
        </div>
    )
}