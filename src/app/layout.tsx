import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Career OS',
  description:
    'AI-tailored CVs, recruiter messages, and application tracking for one owner.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // src/proxy.ts stamps a fresh nonce onto the request headers as x-nonce;
  // forward it to next-themes so its anti-flash inline script is allow-listed
  // by the production CSP instead of being silently blocked.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // next-themes sets the .dark class on this element before React
      // hydrates, which would otherwise trigger a hydration mismatch warning.
      suppressHydrationWarning
    >
      <body>
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
