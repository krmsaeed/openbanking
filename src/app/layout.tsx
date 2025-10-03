import type { Metadata } from 'next';
import './styles/globals.css';
import localFont from 'next/font/local';
import { ToastProvider } from '@/components/ui/feedback/Toast';
import ThemeProvider from '@/lib/ThemeProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import ServiceWorkerUnregistrar from '@/components/ServiceWorkerUnregistrar';
import { UserProvider } from '@/contexts/UserContext';

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
    const stored = localStorage.getItem('theme');
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
  } catch (e) {
    // ignore
  }
})();`,
                    }}
                />
            </head>
            <body
                className={` ${iranYekan.className} flex w-full flex-col items-center bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
            >
                <ThemeProvider>
                    <UserProvider>
                        <ToastProvider>
                            <ThemeToggle />
                            {process.env.NODE_ENV === 'development' ? (
                                <ServiceWorkerUnregistrar />
                            ) : (
                                <ServiceWorkerRegistrar />
                            )}
                            {children}
                        </ToastProvider>
                    </UserProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
