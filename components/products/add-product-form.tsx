'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { createProduct } from '@/lib/actions/products'
import { uploadImageToS3 } from '@/lib/actions/upload'
import { compressImage, validateImageFile } from '@/lib/utils/image-utils'
import { toast } from 'sonner'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

const CATEGORIES = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Meat',
    'Eggs',
    'Grains',
    'Herbs',
    'Honey',
    'Other',
]

const UNITS = ['lb', 'kg', 'piece', 'dozen', 'bunch', 'bag', 'jar', 'bottle']

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function AddProductForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            unit: 'lb',
            category: '',
            imageUrl: '',
            inStock: true,
        },
    })

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file) return

        // Validate the image file
        const validation = await validateImageFile(file, {
            maxSize: MAX_FILE_SIZE,
            allowedTypes: ACCEPTED_IMAGE_TYPES,
            minWidth: 200, // minimum 200px width
            minHeight: 200, // minimum 200px height
        })

        if (!validation.valid) {
            toast.error(validation.error || 'Invalid image file')
            return
        }

        setIsCompressing(true)

        try {
            // Compress the image before storing
            const compressedFile = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.85,
                type: 'image/jpeg',
            })

            setSelectedFile(compressedFile)

            // Show size reduction info
            const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
            const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2)

            if (file.size > compressedFile.size) {
                toast.success(
                    `Image optimized: ${originalSizeMB}MB → ${compressedSizeMB}MB`
                )
            }

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(compressedFile)
        } catch (error) {
            console.error('Compression error:', error)
            toast.error('Failed to process image')
        } finally {
            setIsCompressing(false)
        }
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
        setImagePreview(null)
        form.setValue('imageUrl', '')
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        setIsUploadingImage(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadImageToS3(formData)

            if (!result.success || !result.url) {
                toast.error(result.error || 'Failed to upload image')
                return null
            }

            return result.url
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
            return null
        } finally {
            setIsUploadingImage(false)
        }
    }

    const onSubmit = async (data: ProductFormData) => {
        setIsLoading(true)

        try {
            let imageUrl = data.imageUrl

            // Upload image if a file is selected
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile)
                if (!uploadedUrl) {
                    setIsLoading(false)
                    return
                }
                imageUrl = uploadedUrl
            }

            const result = await createProduct({
                ...data,
                imageUrl,
            })

            if (!result.success) {
                toast.error(result.error || 'Failed to create product')
                return
            }

            toast.success('Product created successfully!')
            form.reset()
            handleRemoveImage()
            router.refresh()
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const isProcessing = isLoading || isUploadingImage || isCompressing

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Fresh Organic Tomatoes"
                                            disabled={isProcessing}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Describe your product..."
                                            disabled={isProcessing}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                disabled={isProcessing}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isProcessing}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {UNITS.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isProcessing}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    {imagePreview ? (
                                        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={imagePreview}
                                                alt="Product preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                                onClick={handleRemoveImage}
                                                disabled={isProcessing}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="image-upload"
                                            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                                isCompressing
                                                    ? 'bg-gray-100 cursor-wait'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {isCompressing ? (
                                                    <>
                                                        <Loader2 className="w-12 h-12 mb-3 text-gray-400 animate-spin" />
                                                        <p className="text-sm text-gray-500">
                                                            Optimizing image...
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ImagePlus className="w-12 h-12 mb-3 text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, JPEG or WebP (MAX. 5MB)
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Images will be automatically optimized
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                                className="hidden"
                                                onChange={handleImageSelect}
                                                disabled={isProcessing}
                                            />
                                        </label>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload an image of your product (optional)
                            </FormDescription>
                        </FormItem>

                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isCompressing
                                        ? 'Optimizing Image...'
                                        : isUploadingImage
                                            ? 'Uploading Image...'
                                            : 'Creating...'}
                                </>
                            ) : (
                                'Create Product'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}