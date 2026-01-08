import { MetadataRoute } from 'next'
import prisma from '@/lib/db/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'
  const locales = ['en', 'fr', 'es']

  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/products', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/map', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/login', changeFrequency: 'monthly' as const, priority: 0.3 },
    { path: '/register', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.2 },
  ]

  const staticRoutes = locales.flatMap(locale =>
    staticPages.map(page => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  )

  // Dynamic product pages
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  })

  const productRoutes = locales.flatMap(locale =>
    products.map(product => ({
      url: `${baseUrl}/${locale}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...staticRoutes, ...productRoutes]
}
