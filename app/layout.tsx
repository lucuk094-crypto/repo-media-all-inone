import type {Metadata, Viewport} from 'next';
import { Inter, Raleway } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter'
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-raleway'
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
  themeColor: '#F5F1E8',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${raleway.variable} font-sans bg-[#F5F1E8] dark:bg-[#2C1810] text-[#2C1810] dark:text-[#F5F1E8] min-h-screen antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
