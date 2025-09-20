/// <reference types="node" />
import { Server } from "http";
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
    env: {
        BASE_URL: "http://192.168.91.112:9999"
    }
    // serverRuntimeConfig: {
    //     server:{
    //         "/api": {
    //             "basePath": "http://192.168.91.112:9999"
    //         }
    //     },
    //     port: 3000,
    // },
};


export default nextConfig;
