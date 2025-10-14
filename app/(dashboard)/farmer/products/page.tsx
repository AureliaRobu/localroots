import { requireFarmer } from '@/lib/auth/session'
import { AddProductForm } from '@/components/products/add-product-form'
import prisma from '@/lib/db/prisma'
import { ProductCard } from '@/components/products/product-card'

async function getFarmerProducts(userId: string) {
    const products = await prisma.product.findMany({
        where: { farmerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            farmer: {
                select: {
                    name: true,
                    farmerProfile: {
                        select: {
                            farmName: true,
                            city: true,
                            state: true,
                        }
                    }
                }
            }
        }
    })
    return products
}

export default async function FarmerProductsPage() {
    const user = await requireFarmer()
    const products = await getFarmerProducts(user.id)

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
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
                            <div className="grid gap-6 sm:grid-cols-2">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        description={product.description}
                                        price={product.price}
                                        unit={product.unit}
                                        category={product.category}
                                        imageUrl={product.imageUrl}
                                        inStock={product.inStock}
                                        farmerName={product.farmer.name}
                                        farmName={product.farmer.farmerProfile?.farmName}
                                        city={product.farmer.farmerProfile?.city}
                                        state={product.farmer.farmerProfile?.state}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}