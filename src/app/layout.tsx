import AuthInitializer from '@/components/AuthInitializer';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import ServiceWorkerUnregistrar from '@/components/ServiceWorkerUnregistrar';
import ThemeToggle from '@/components/ThemeToggle';
import { ToastProvider } from '@/components/ui/feedback/Toast';
import { UserProvider } from '@/contexts/UserContext';
import ThemeProvider from '@/lib/ThemeProvider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import './styles/globals.css';

export const metadata: Metadata = {
    title: '...اقتصاد نوین | هوشمندانه پرداخت کنید',
    description: 'بانک اقتصاد نوین',
};

const iranYekan = localFont({
    src: [
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebThin.woff2',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebRegular.woff2',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebBold.woff2',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../assets/fonts/iranyekan/IRANYekanWebExtraBold.woff2',
            weight: '900',
            style: 'normal',
        },
    ],
    display: 'swap',
    preload: false,
});
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa-IR" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/icons/favicon.ico"></link>
                <meta name="color-scheme" content="light dark" />
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
                                const theme = stored || (prefersDark ? 'dark' : 'light');
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
                            <Suspense fallback={<div>Loading...</div>}>
                                <AuthInitializer requireAuth={false}>
                                    <ThemeToggle />
                                    {process.env.NODE_ENV === 'development' ? (
                                        <ServiceWorkerUnregistrar />
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
