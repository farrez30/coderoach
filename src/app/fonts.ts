import { JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

/** Shared by both public root layouts, the site and the presentation, so they declare the faces once. */
export const satoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.ttf',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});
