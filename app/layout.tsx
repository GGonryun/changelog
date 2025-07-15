import './globals.css';
import { Roboto, Playfair_Display, Open_Sans } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';

import { Analytics } from '@vercel/analytics/react';
import { cn } from '@/lib/utils';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap'
});

export const metadata = {
  title: 'Changelog',
  description: 'Automatically generated changelog for your project'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(playfair.variable, openSans.variable)}>
      <body>
        <main className="flex h-screen w-screen flex-col">{children}</main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
