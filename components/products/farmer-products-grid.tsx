'use client'

import { useState } from 'react'
import { FarmerProductCard } from './farmer-product-card'
import { EditProductDialog } from './edit-product-dialog'
import type { Product } from '@prisma/client'

type Props = {
    products: Product[]
}

export function FarmerProductsGrid({ products }: Props) {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2">
                {products.map((product) => (
                    <FarmerProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        unit={product.unit}
                        category={product.category}
                        imageUrl={product.imageUrl}
                        inStock={product.inStock}
                        onEdit={() => setEditingProduct(product)}
                    />
                ))}
            </div>

            {editingProduct && (
                <EditProductDialog
                    product={editingProduct}
                    open={!!editingProduct}
                    onOpenChange={(open) => !open && setEditingProduct(null)}
                />
            )}
        </>
    )
}