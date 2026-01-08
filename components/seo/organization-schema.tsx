const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LocalRoots',
    url: baseUrl,
    logo: `${baseUrl}/icon-512`,
    description: 'Marketplace connecting local organic farmers with customers who value fresh, sustainable food',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'French', 'Spanish'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
