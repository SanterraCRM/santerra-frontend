import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';
import Providers from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'WebUp!',
    template: '%s | WebUp!',
  },
  description: 'Sistemas para mais performance e organização no seu negócio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' className={jakarta.variable} suppressHydrationWarning>
      <body className='font-sans antialiased'>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
