'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
    categories: string[]
}

export function ProductsFilters({ categories }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [category, setCategory] = useState(searchParams.get('category') || 'all')
    const [inStock, setInStock] = useState(searchParams.get('inStock') || 'all')

    const handleFilter = () => {
        const params = new URLSearchParams()

        if (search) params.set('search', search)
        if (category && category !== 'all') params.set('category', category)
        if (inStock && inStock !== 'all') params.set('inStock', inStock)

        startTransition(() => {
            router.push(`/products?${params.toString()}`)
        })
    }

    const handleClear = () => {
        setSearch('')
        setCategory('all')
        setInStock('all')
        startTransition(() => {
            router.push('/products')
        })
    }

    const hasFilters = search || (category && category !== 'all') || (inStock && inStock !== 'all')

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stock Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Availability</Label>
                        <Select value={inStock} onValueChange={setInStock}>
                            <SelectTrigger id="stock">
                                <SelectValue placeholder="All products" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="true">In Stock Only</SelectItem>
                                <SelectItem value="false">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleFilter}
                            disabled={isPending}
                            className="flex-1"
                        >
                            {isPending ? 'Filtering...' : 'Apply Filters'}
                        </Button>
                        {hasFilters && (
                            <Button
                                onClick={handleClear}
                                variant="outline"
                                disabled={isPending}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}