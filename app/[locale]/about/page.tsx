import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AboutPage() {
    const t = useTranslations('about');

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            {/* Hero Section */}
            <section className="mx-auto max-w-4xl px-4 py-20 text-center">
                <div className="mb-6 text-6xl">🌱</div>
                <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                    {t('title')}
                </h1>
                <p className="mx-auto mt-6 text-2xl font-medium text-green-600">
                    {t('tagline')}
                </p>
            </section>

            {/* Hero Image - Community Farmers */}
            <section className="mx-auto max-w-6xl px-4 py-8">
                <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-xl">
                    <Image
                        src="https://d2mjb2yuuea7w7.cloudfront.net/static/about-hero.jpg"
                        alt="Happy farmers at community farm with fresh vegetables"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </section>

            {/* Mission Section */}
            <section className="mx-auto max-w-4xl px-4 py-12">
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">{t('mission.title')}</h2>
                        <p className="mb-4 text-lg leading-relaxed text-slate-700">
                            {t('mission.paragraph1')}
                        </p>
                        <p className="text-lg leading-relaxed text-slate-700">
                            {t('mission.paragraph2')}
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* Story Section with Image */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                    <Card className="bg-slate-50">
                        <CardContent className="pt-6">
                            <p className="text-lg leading-relaxed text-slate-700">
                                {t('story')}
                            </p>
                        </CardContent>
                    </Card>
                    <div className="relative h-[300px] overflow-hidden rounded-xl shadow-lg">
                        <Image
                            src="https://d2mjb2yuuea7w7.cloudfront.net/static/about-organic-farm.jpg"
                            alt="Basket of fresh organic carrots"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Why LocalRoots - Values Grid */}
            <section className="mx-auto max-w-6xl px-4 py-16">
                <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">
                    {t('why.title')}
                </h2>
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Direct Connection */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🌾</div>
                            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                                {t('why.direct.title')}
                            </h3>
                            <p className="leading-relaxed text-slate-700">
                                {t('why.direct.description')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Fair Trade */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🍅</div>
                            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                                {t('why.fair.title')}
                            </h3>
                            <p className="leading-relaxed text-slate-700">
                                {t('why.fair.description')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Local & Sustainable */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🚲</div>
                            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                                {t('why.sustainable.title')}
                            </h3>
                            <p className="leading-relaxed text-slate-700">
                                {t('why.sustainable.description')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Community First */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">💬</div>
                            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                                {t('why.community.title')}
                            </h3>
                            <p className="leading-relaxed text-slate-700">
                                {t('why.community.description')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* No AI, Just People */}
                    <Card className="md:col-span-2">
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🌻</div>
                            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                                {t('why.real.title')}
                            </h3>
                            <p className="leading-relaxed text-slate-700">
                                {t('why.real.description')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Community Image Section */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                    <div className="relative h-[350px] overflow-hidden rounded-xl shadow-lg order-2 md:order-1">
                        <Image
                            src="https://d2mjb2yuuea7w7.cloudfront.net/static/about-fresh-produce.jpg"
                            alt="Local farmers market with shop local banner and fresh produce"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="order-1 md:order-2">
                        <h3 className="mb-4 text-3xl font-bold text-slate-900">Growing Together</h3>
                        <p className="text-lg leading-relaxed text-slate-700">
                            Every farmer, every customer, every purchase — they all contribute to building a resilient local food network. When you choose LocalRoots, you&apos;re not just buying food; you&apos;re investing in your community&apos;s future.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto max-w-4xl px-4 py-16">
                <Card className="bg-green-600 text-white">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">{t('cta.title')}</h2>
                        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-green-50">
                            {t('cta.description')}
                        </p>
                        <p className="mb-8 text-2xl font-semibold text-white">
                            {t('cta.tagline')}
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
    );
}
