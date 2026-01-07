import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'd2mjb2yuuea7w7.cloudfront.net',
              pathname: '/**',
            },
        ],
        formats: ['image/avif', 'image/webp'], // Modern image formats
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Responsive image sizes
    },
    // Optimize production builds
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
    // Enable experimental features for better performance
    experimental: {
        optimizePackageImports: ['@/components/ui'], // Tree-shake large packages (exclude leaflet/react-leaflet)
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);