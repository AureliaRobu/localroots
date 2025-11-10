import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl';

export default function HomePage() {
    const t = useTranslations('home');
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')"
                    }}
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

            {/* Features Section */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid gap-8 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🌱</div>
                            <h3 className="mb-2 text-xl font-semibold">{t('features.organic.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.organic.description')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">📍</div>
                            <h3 className="mb-2 text-xl font-semibold">{t('features.local.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.local.description')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🤝</div>
                            <h3 className="mb-2 text-xl font-semibold">{t('features.community.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.community.description')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
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