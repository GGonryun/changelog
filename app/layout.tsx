import './globals.css';
import { Toaster } from '@/components/ui/toaster';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Changelog',
  description: 'Build powerful interactive bots with ease'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen w-full flex-col">{children}</main>
        <Toaster />

        <Analytics />
      </body>
    </html>
  );
}
