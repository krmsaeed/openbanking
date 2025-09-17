/// <reference types="node" />
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
    },
    // swcMinify: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['@heroicons/react'],
    },
    serverRuntimeConfig: {
        port: 3000,
    },
    env: {
        PORT: "3000",
    },
};


export default nextConfig;
