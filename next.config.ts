/// <reference types="node" />
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // produce a standalone build (server + minimal node_modules) in .next/standalone
    output: 'standalone',
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['@heroicons/react', 'react-hot-toast'],
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    compress: true,
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Vendor chunk for React and related libraries
                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /node_modules\/(react|react-dom|next)/,
                        priority: 20,
                    },
                    // UI components chunk
                    ui: {
                        name: 'ui',
                        chunks: 'all',
                        test: /[\\/]components[\\/]ui[\\/]/,
                        priority: 10,
                    },
                    // Common chunk for shared utilities
                    common: {
                        name: 'common',
                        chunks: 'all',
                        minChunks: 2,
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            };
        }
        return config;
    },
    env: {
        BASE_URL: 'http://192.168.91.112:9999',
    },

    // async rewrites() {
    //     return [
    //         {
    //             source: '/api/:path*',
    //             destination: 'http://192.168.91.112:9999/bpms/:path*',
    //         }
    //     ]
    // }
};

export default nextConfig;
