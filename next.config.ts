/// <reference types="node" />

const nextConfig = {
    output: 'standalone',
    compress: true, // Gzip compression
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
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
        if (!dev && !isServer) {
            // Use default splitChunks with aggressive tree shaking
            config.optimization.usedExports = true;
            config.optimization.sideEffects = true;
            config.optimization.minimize = true;
        }
        return config;
    },
    env: {
        BASE_URL: 'http://192.168.91.112:9999',
        IS_STAGE: true,
    },
};

export default nextConfig;
