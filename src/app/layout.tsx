import AuthInitializer from '@/components/AuthInitializer';
import ErrorCatalogInitializer from '@/components/ErrorCatalogInitializer';
import InstallPWA from '@/components/InstallPWA';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import ServiceWorkerUnregistrar from '@/components/ServiceWorkerUnregistrar';
import { ToastProvider } from '@/components/ui/feedback/Toast';
import { UserProvider } from '@/contexts/UserContext';
import ThemeProvider from '@/lib/ThemeProvider';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import './styles/globals.css';

// export const dynamic = 'force-dynamic'; // Removed to fix standalone build issue

export const metadata: Metadata = {
    title: 'اقتصاد نوین | هوشمندانه پرداخت کنید',
    description: 'بانک اقتصاد نوین - پرداخت آسان و امن اقساط',
    applicationName: 'بانک اقتصاد نوین',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'اقتصاد نوین',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            { url: '/icons/favicon.ico' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
};

const iranYekan = localFont({
    src: [
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebThin.woff2',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebLight.woff2',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebRegular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebMedium.woff2',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebBold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    display: 'swap', // فونت fallback نشان داده شود قبل از بارگذاری
    fallback: ['system-ui', '-apple-system', 'sans-serif'],
});
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa-IR" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/icons/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#0066cc" />
                <meta name="color-scheme" content="light dark" />

                {/* iOS Safari PWA */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="اقتصاد نوین" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

                {/* Android Chrome PWA */}
                <meta name="mobile-web-app-capable" content="yes" />

                {/* Windows Tiles */}
                <meta name="msapplication-TileColor" content="#0066cc" />
                <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

                <script
                    dangerouslySetInnerHTML={{
                        __html: `(() => {
                            try {
                                const getCookie = (name) => {
                                    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
                                    return match ? match[1] : null;
                                };
                                const stored = getCookie('theme');
                                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                                const theme = stored || 'light';
                                if (theme === 'dark') {
                                document.documentElement.classList.add('dark');
                                document.body.classList.add('dark');
                                document.documentElement.setAttribute('data-theme', 'dark');
                                } else {
                                document.documentElement.classList.remove('dark');
                                document.body.classList.remove('dark');
                                document.documentElement.setAttribute('data-theme', 'light');
                                }
                            } catch (e) {}
                            })();`,
                    }}
                />
            </head>
            <body className={` ${iranYekan.className} bg-gray flex w-full flex-col items-center`}>
                <ThemeProvider>
                    <UserProvider>
                        <ToastProvider>
                            <ErrorCatalogInitializer />
                            {process.env.IS_STAGE === "false" && <InstallPWA />}
                            <Suspense fallback={<></>}>
                                <AuthInitializer requireAuth={false}>
                                    {process.env.NODE_ENV === 'development' ? (
                                        <>
                                            <ServiceWorkerUnregistrar />
                                            <ServiceWorkerRegistrar />
                                        </>
                                    ) : (
                                        <ServiceWorkerRegistrar />
                                    )}
                                    {children}
                                </AuthInitializer>
                            </Suspense>
                        </ToastProvider>
                    </UserProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
