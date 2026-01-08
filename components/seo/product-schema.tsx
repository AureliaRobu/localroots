const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'

interface ProductSchemaProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    unit: string
    imageUrl: string | null
    inStock: boolean
    averageRating: number | null
    reviewCount: number
    farmer: {
      name: string | null
      sellerProfile: {
        farmName: string
        city: string
        state: string | null
      } | null
    }
  }
  locale: string
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Fresh ${product.name} from local organic farmers`,
    image: product.imageUrl,
    url: `${baseUrl}/${locale}/products/${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.farmer.sellerProfile?.farmName || product.farmer.name || 'Local Farm',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: product.farmer.sellerProfile ? {
        '@type': 'LocalBusiness',
        name: product.farmer.sellerProfile.farmName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: product.farmer.sellerProfile.city,
          addressRegion: product.farmer.sellerProfile.state,
        },
      } : undefined,
    },
    ...(product.averageRating && product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
