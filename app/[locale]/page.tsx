import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl';

export default function HomePage() {
    const t = useTranslations('home');
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            {/* Hero Section */}
            <section className="mx-auto max-w-7xl px-4 py-20 text-center">
                <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                    {t('header1')}
                    <span className="text-green-600"> {t('header2')}</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                    {t('subheader')}
                </p>
                <div className="mt-10 flex items-center justify-center gap-4">
                    <Link href="/products">
                        <Button size="lg" className="text-lg">
                            {t('browse')}
                        </Button>
                    </Link>
                    <Link href="/map">
                        <Button size="lg" variant="outline" className="text-lg">
                            {t('viewMap')}
                        </Button>
                    </Link>
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