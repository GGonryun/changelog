import './globals.css';
import { Playfair_Display, Open_Sans } from 'next/font/google';

import { Toaster } from '@/components/ui/toaster';

import { Analytics } from '@vercel/analytics/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
        <main className="flex h-screen w-screen flex-col">
          <div className="absolute bg-gradient-to-r from-[#00AA8D]/60 to-[#00AA8D]/10 text-2xl font-bold p-4 top-0 left-0 w-full">
            <Image
              src="/logos/p0.png"
              alt="Project Zero Logo"
              width={200}
              height={32}
              priority
              className="inline-block mr-2"
            />
          </div>
          <div className="pt-16">{children}</div>
        </main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
