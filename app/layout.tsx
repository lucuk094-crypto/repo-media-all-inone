import type {Metadata, Viewport} from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk'
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
  themeColor: '#0F172A',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${spaceGrotesk.variable} font-sans bg-[#F8FAFC] text-[#0F172A] min-h-screen antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
