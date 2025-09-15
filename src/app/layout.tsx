import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ToastProvider } from "@/components/ui/feedback/Toast";

export const metadata: Metadata = {
  title: "پرداخت نوین | هوشمندانه پرداخت کنید...",
  description: "بانک پرداخت نوین",
};

const iranYekan = localFont({
  src: [
    {
      path: "../assets/fonts/iranyekan/IRANYekanWebThin.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/iranyekan/IRANYekanWebRegular.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/iranyekan/IRANYekanWebMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/iranyekan/IRANYekanWebBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/iranyekan/IRANYekanWebExtraBold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa-IR">
      <head>
        <link rel="icon" href="/images/fav-icon.png"></link>
      </head>
      <body className={` ${iranYekan.className} flex flex-col items-center w-full`} suppressHydrationWarning={true}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}