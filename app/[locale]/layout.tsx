import type {Metadata} from "next";
import {Lora, Poppins} from "next/font/google";
import {Toaster} from "@/components/ui/sonner";
import {Header} from "@/components/layout/header";
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
    weight: ['300', '400', '500', '600', '700'],
    variable: "--font-poppins",
    subsets: ["latin"],
});

const lora = Lora({
    weight: ['400', '500', '600', '700'],
    variable: "--font-lora",
    subsets: ["latin"],
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
            className={`${poppins.variable} ${lora.variable} antialiased`}
        >
        <NextIntlClientProvider>
            <CartProvider>
                <Header/>
                {children}
                <SpeedInsights/>
                <Toaster/>
            </CartProvider>
        </NextIntlClientProvider>
        </body>
        </html>

    );
}