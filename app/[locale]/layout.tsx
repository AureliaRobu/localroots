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

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

const poppins = Poppins({
    weight: ['400', '600', '700'], // Reduced from 5 to 3 weights
    variable: "--font-poppins",
    subsets: ["latin"],
    display: 'swap', // Prevents FOIT - shows fallback font immediately
    preload: true, // Preload the font
    fallback: ['system-ui', 'arial'], // Better fallback fonts
});

const lora = Lora({
    weight: ['400', '600', '700'], // Reduced from 4 to 3 weights
    variable: "--font-lora",
    subsets: ["latin"],
    display: 'swap', // Prevents FOIT - shows fallback font immediately
    preload: true, // Preload the font
    fallback: ['georgia', 'serif'], // Better fallback fonts
});

export const metadata: Metadata = {
    title: "LocalRoots - Organic Farmers Marketplace",
    description: "Connect with local organic farmers and browse fresh produce",
};

export default async function RootLayout({
                                             children, params
                                         }: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }
    return (
        <html lang="en">
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