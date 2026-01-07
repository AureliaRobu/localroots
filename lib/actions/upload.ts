'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export async function uploadImageToS3(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get('file') as File

        if (!file) {
            return {
                success: false,
                error: 'No file provided',
            }
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return {
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
            }
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: 'File size exceeds 5MB limit.',
            }
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const fileExtension = file.name.split('.').pop()
        const fileName = `products/${randomUUID()}.${fileExtension}`

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            // Make the object publicly readable (optional, depending on your bucket policy)
            // ACL: 'public-read',
        })

        await s3Client.send(command)

        // Construct the URL using CloudFront CDN
        const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || 'd2mjb2yuuea7w7.cloudfront.net'
        const imageUrl = `https://${cloudfrontDomain}/${fileName}`

        return {
            success: true,
            url: imageUrl,
        }
    } catch (error) {
        console.error('S3 upload error:', error)
        return {
            success: false,
            error: 'Failed to upload image to S3',
        }
    }
}

// Optional: Delete image from S3
export async function deleteImageFromS3(imageUrl: string): Promise<UploadResult> {
    try {
        // Extract the key from the URL
        const url = new URL(imageUrl)
        const key = url.pathname.substring(1) // Remove leading slash

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })

        await s3Client.send(command)

        return {
            success: true,
        }
    } catch (error) {
        console.error('S3 delete error:', error)
        return {
            success: false,
            error: 'Failed to delete image from S3',
        }
    }
}