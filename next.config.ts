import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['@heroicons/react'],
    },
    // Server configuration for port 3000
    serverRuntimeConfig: {
        port: 3000,
    },
    env: {
        PORT: "3000",
    },
};

export default nextConfig;
