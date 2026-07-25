import type {Metadata, Viewport} from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: 'VAN-X 313 . ALL IN',
  description: 'Universal Media Downloader - Neon Brutalism Edition',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VAN-X 313"
  }
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} font-sans bg-black text-white min-h-screen antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
