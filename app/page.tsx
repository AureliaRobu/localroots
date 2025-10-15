import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            {/* Hero Section */}
            <section className="mx-auto max-w-7xl px-4 py-20 text-center">
                <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                    Connect with Local
                    <span className="text-green-600"> Organic Farmers</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                    Discover fresh, organic produce from farmers in your community.
                    Support local agriculture and eat healthier today.
                </p>
                <div className="mt-10 flex items-center justify-center gap-4">
                    <Link href="/products">
                        <Button size="lg" className="text-lg">
                            Browse Products
                        </Button>
                    </Link>
                    <Link href="/map">
                        <Button size="lg" variant="outline" className="text-lg">
                            View Map
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
                            <h3 className="mb-2 text-xl font-semibold">100% Organic</h3>
                            <p className="text-slate-600">
                                All products are certified organic and grown with care by local farmers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">📍</div>
                            <h3 className="mb-2 text-xl font-semibold">Local & Fresh</h3>
                            <p className="text-slate-600">
                                Find farmers near you and get the freshest produce available.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 text-4xl">🤝</div>
                            <h3 className="mb-2 text-xl font-semibold">Support Community</h3>
                            <p className="text-slate-600">
                                Your purchase directly supports local farmers and sustainable agriculture.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <Card className="bg-green-600 text-white">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Are you a farmer?</h2>
                        <p className="mb-8 max-w-xl text-green-50">
                            Join our marketplace and connect with customers who value organic,
                            locally-grown produce.
                        </p>
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="text-lg">
                                Start Selling Today
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}