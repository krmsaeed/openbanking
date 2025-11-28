/// <reference types="node" />

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const nextConfig = {
    output: 'standalone', // Enable standalone output
    compress: true, // Gzip compression
    productionBrowserSourceMaps: false, // Disable source maps in production
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
        reactRemoveProperties: true, // Remove React-only props
    },
    experimental: {
        optimizeCss: true,
        optimizePackageImports: [
            '@heroicons/react',
            'react-hot-toast',
            'clsx',
            'tailwind-merge',
            'zod',
            'react-hook-form',
        ],
    },
    turbopack: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
        if (!dev && !isServer) {
            config.optimization.usedExports = true;
            config.optimization.sideEffects = true;
            config.optimization.minimize = true;
            config.devtool = false;
        }
        return config;
    },
    env: {
        // BASE_URL: 'https://192.168.50.49:9999',
        // BASE_URL: 'https://10.224.2.3:4999',
        BASE_URL: 'https://192.168.91.112:4999',
        // BASE_URL: 'https://novinhubtst.enbank.ir/',
        IS_STAGE: 'true',
    },
};

export default nextConfig;
