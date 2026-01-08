import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { ClosestProducts } from '@/components/products/closest-products'
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'

type Props = {
    params: Promise<{ locale: string }>
}

const seoContent = {
    en: {
        title: 'Real Farmers. Real Food. Real Connections.',
        description: 'Discover fresh, organic produce from farmers in your community. Support local agriculture, connect directly with farmers, and eat healthier with LocalRoots marketplace.',
    },
    fr: {
        title: 'Vrais agriculteurs. Vraie nourriture. Vraies connexions.',
        description: 'Découvrez des produits frais et biologiques des agriculteurs de votre communauté. Soutenez l\'agriculture locale avec LocalRoots.',
    },
    es: {
        title: 'Agricultores reales. Comida real. Conexiones reales.',
        description: 'Descubre productos frescos y orgánicos de agricultores de tu comunidad. Apoya la agricultura local con LocalRoots.',
    },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    const content = seoContent[locale as keyof typeof seoContent] || seoContent.en

    return {
        title: content.title,
        description: content.description,
        openGraph: {
            title: `LocalRoots - ${content.title}`,
            description: content.description,
            url: `${baseUrl}/${locale}`,
            images: [{ url: `${baseUrl}/og-image`, width: 1200, height: 630 }],
        },
        alternates: {
            canonical: `${baseUrl}/${locale}`,
        },
    }
}

export default function HomePage() {
    const t = useTranslations('home');
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image - Using Next.js Image for LCP optimization */}
                <Image
                    src="https://d2mjb2yuuea7w7.cloudfront.net/static/hero-farm-field.jpg"
                    alt="Farm field landscape"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Content */}
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                        {t('header')}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                        {t('subheader')}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Link href="/products">
                            <Button size="lg" className="text-lg bg-green-600 hover:bg-green-700">
                                {t('browse')}
                            </Button>
                        </Link>
                        <Link href="/map">
                            <Button size="lg" variant="outline" className="text-lg border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900">
                                {t('viewMap')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Target Audiences Section */}
            <section className="mx-auto max-w-7xl px-4 py-20">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900">{t('audiences.title')}</h2>
                </div>

                <div className="space-y-20">
                    {/* Local Food Enthusiasts */}
                    <div className="grid gap-8 md:grid-cols-2 items-center">
                        <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg">
                            <Image
                                src="https://d2mjb2yuuea7w7.cloudfront.net/static/audience-local-food.jpg"
                                alt="Local food enthusiasts shopping"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t('audiences.enthusiasts.title')}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {t('audiences.enthusiasts.description')}
                            </p>
                            <div className="pt-4">
                                <Link href="/products">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                        {t('audiences.enthusiasts.cta')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Small-Scale Organic Farmers - Reverse layout */}
                    <div className="grid gap-8 md:grid-cols-2 items-center">
                        <div className="space-y-4 md:order-1">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t('audiences.farmers.title')}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {t('audiences.farmers.description')}
                            </p>
                            <div className="pt-4">
                                <Link href="/register">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                        {t('audiences.farmers.cta')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg md:order-2">
                            <Image
                                src="https://d2mjb2yuuea7w7.cloudfront.net/static/audience-organic-farmer.jpg"
                                alt="Organic farmer in field"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Community Organizers */}
                    <div className="grid gap-8 md:grid-cols-2 items-center">
                        <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg">
                            <Image
                                src="https://d2mjb2yuuea7w7.cloudfront.net/static/audience-community.jpg"
                                alt="Community gathering"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t('audiences.organizers.title')}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {t('audiences.organizers.description')}
                            </p>
                            <div className="pt-4">
                                <Link href="/register">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                        {t('audiences.organizers.cta')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closest Products Section */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <ClosestProducts />
            </section>

            {/* CTA Section */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <Card className="bg-green-600 text-white">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">{t('cta.title')}</h2>
                        <p className="mb-8 max-w-xl text-green-50">
                            {t('cta.description')}
                        </p>
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="text-lg">
                                {t('cta.button')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}