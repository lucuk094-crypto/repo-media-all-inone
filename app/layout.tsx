import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'VAN-X 313 . ALL IN - Pengunduh Media Universal',
  description: 'Unduh video dan media dari Instagram, TikTok, Facebook, CapCut, dan Spotify dengan mudah dan cepat.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VAN-X 313 . ALL IN"
  }
};

export const viewport: Viewport = {
  themeColor: '#FAFAF9',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans bg-stone-50 text-stone-900 min-h-screen antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
