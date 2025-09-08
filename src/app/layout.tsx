import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { logoFont } from '@/lib/fonts'
import "./globals.css";
import { Toaster } from '@/components/ui/sonner'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NepQue - Save Money with Amazing Coupons",
  description: "Discover thousands of verified coupons, deals, and cashback offers from your favorite brands. Start saving today with NepQue!",
  keywords: "coupons, deals, discount codes, cashback, savings, shopping",
  authors: [{ name: "NepQue Team" }],
  metadataBase: new URL('https://nepque.com'),
  applicationName: 'NepQue',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    }
  },
  openGraph: {
    title: "NepQue - Save Money with Amazing Coupons",
    description: "Discover thousands of verified coupons, deals, and cashback offers from your favorite brands.",
    type: "website",
    locale: "en_US",
    siteName: 'NepQue'
  },
  twitter: {
    card: "summary_large_image",
    title: "NepQue - Save Money with Amazing Coupons",
    description: "Discover thousands of verified coupons, deals, and cashback offers from your favorite brands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${logoFont.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
