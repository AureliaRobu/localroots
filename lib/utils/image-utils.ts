/**
 * Client-side image optimization utilities
 * Use these functions to compress images before uploading to S3
 */

export interface ImageCompressionOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number // 0 to 1
    type?: string // 'image/jpeg' | 'image/png' | 'image/webp'
}

/**
 * Compress an image file before upload
 */
export async function compressImage(
    file: File,
    options: ImageCompressionOptions = {}
): Promise<File> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        type = 'image/jpeg',
    } = options

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Calculate new dimensions while maintaining aspect ratio
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'))
                            return
                        }

                        const compressedFile = new File([blob], file.name, {
                            type,
                            lastModified: Date.now(),
                        })

                        resolve(compressedFile)
                    },
                    type,
                    quality
                )
            }

            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Convert HEIC/HEIF images to JPEG
 * Note: This requires a library like 'heic2any' for actual conversion
 * Install with: npm install heic2any
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
    // This is a placeholder - you'll need to install heic2any for actual conversion
    // import heic2any from 'heic2any'

    if (file.type === 'image/heic' || file.type === 'image/heif') {
        console.warn('HEIC conversion not implemented. Install heic2any package.')
        // const converted = await heic2any({ blob: file, toType: 'image/jpeg' })
        // return new File([converted as Blob], file.name.replace(/\.heic$/i, '.jpg'), {
        //   type: 'image/jpeg',
        // })
    }

    return file
}

/**
 * Get image dimensions
 */
export function getImageDimensions(
    file: File
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                resolve({ width: img.width, height: img.height })
            }

            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Validate image file
 */
export function validateImageFile(
    file: File,
    options: {
        maxSize?: number // in bytes
        allowedTypes?: string[]
        minWidth?: number
        minHeight?: number
    } = {}
): Promise<{ valid: boolean; error?: string }> {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        minWidth = 0,
        minHeight = 0,
    } = options

    return new Promise(async (resolve) => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            resolve({
                valid: false,
                error: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}`,
            })
            return
        }

        // Check file size
        if (file.size > maxSize) {
            resolve({
                valid: false,
                error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`,
            })
            return
        }

        // Check dimensions if specified
        if (minWidth > 0 || minHeight > 0) {
            try {
                const dimensions = await getImageDimensions(file)

                if (dimensions.width < minWidth || dimensions.height < minHeight) {
                    resolve({
                        valid: false,
                        error: `Image must be at least ${minWidth}x${minHeight} pixels`,
                    })
                    return
                }
            } catch (error) {
                resolve({
                    valid: false,
                    error: 'Failed to validate image dimensions',
                })
                return
            }
        }

        resolve({ valid: true })
    })
}