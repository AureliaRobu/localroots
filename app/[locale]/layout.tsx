import type {Metadata} from "next";
import {Lora, Poppins} from "next/font/google";
import {Toaster} from "@/components/ui/sonner";
import {Header} from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {CartProvider} from '@/lib/context/cart-context';
import {OrganizationSchema, WebsiteSchema} from '@/components/seo';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.earth'

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

const poppins = Poppins({
    weight: ['400', '600', '700'],
    variable: "--font-poppins",
    subsets: ["latin"],
    display: 'swap',
    preload: true,
    fallback: ['system-ui', 'arial'],
});

const lora = Lora({
    weight: ['400', '600', '700'],
    variable: "--font-lora",
    subsets: ["latin"],
    display: 'swap',
    preload: true,
    fallback: ['georgia', 'serif'],
});

const seoContent = {
    en: {
        title: 'LocalRoots - Local Organic Farmers Marketplace',
        description: 'Connect with local organic farmers. Browse fresh produce, support sustainable agriculture, and discover farm-to-table food in your community.',
    },
    fr: {
        title: 'LocalRoots - Marché des Agriculteurs Bio Locaux',
        description: 'Connectez-vous avec les agriculteurs bio locaux. Parcourez les produits frais et soutenez l\'agriculture durable dans votre communauté.',
    },
    es: {
        title: 'LocalRoots - Mercado de Agricultores Orgánicos Locales',
        description: 'Conecta con agricultores orgánicos locales. Descubre productos frescos y apoya la agricultura sostenible en tu comunidad.',
    },
} as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    const content = seoContent[locale as keyof typeof seoContent] || seoContent.en

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: content.title,
            template: "%s | LocalRoots",
        },
        description: content.description,
        keywords: [
            "organic farmers", "local produce", "farm to table",
            "sustainable agriculture", "farmers market", "organic food",
            "local food", "fresh vegetables", "organic marketplace",
            "buy local", "support farmers"
        ],
        authors: [{ name: "LocalRoots" }],
        creator: "LocalRoots",
        publisher: "LocalRoots",
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        icons: {
            icon: [
                { url: "/icon.svg", type: "image/svg+xml" },
                { url: "/icon", type: "image/png", sizes: "32x32" },
            ],
            apple: "/apple-icon",
        },
        manifest: "/manifest.webmanifest",
        openGraph: {
            type: 'website',
            locale: locale,
            alternateLocale: ['en', 'fr', 'es'].filter(l => l !== locale),
            url: `${baseUrl}/${locale}`,
            siteName: 'LocalRoots',
            title: content.title,
            description: content.description,
            images: [
                {
                    url: `${baseUrl}/og-image`,
                    width: 1200,
                    height: 630,
                    alt: 'LocalRoots - Local Organic Farmers Marketplace',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: content.title,
            description: content.description,
            images: [`${baseUrl}/og-image`],
        },
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                'en': `${baseUrl}/en`,
                'fr': `${baseUrl}/fr`,
                'es': `${baseUrl}/es`,
                'x-default': `${baseUrl}/en`,
            },
        },
        other: {
            "theme-color": "#16a34a",
            "msapplication-TileColor": "#16a34a",
        },
    }
}

export default async function RootLayout({ children, params }: Readonly<Props>) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    return (
        <html lang={locale}>
        <head>
            <OrganizationSchema />
            <WebsiteSchema />
        </head>
        <body
            className={`${poppins.variable} ${lora.variable} antialiased flex flex-col min-h-screen`}
        >
        <NextIntlClientProvider>
            <CartProvider>
                <Header/>
                <main className="flex-1">
                    {children}
                </main>
                <Footer/>
                <CookieConsent/>
                <SpeedInsights/>
                <Toaster/>
            </CartProvider>
        </NextIntlClientProvider>
        </body>
        </html>

    );
}