import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
              protocol: 'https',
              hostname: 'localroots-product-images.s3.eu-north-1.amazonaws.com',
              pathname: '/**',
            },
        ],
    },
};

export default nextConfig;