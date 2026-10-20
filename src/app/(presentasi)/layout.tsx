import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { jetbrainsMono, satoshi } from '../fonts';

const metadataBase = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000');

/**
 * The presentation's own root layout: shown at a client's office, so no site nav, no announcement
 * popup, and no analytics (GA4 and the Meta pixel live in the site's layout only). Not indexed.
 */
export const metadata: Metadata = {
  metadataBase,
  title: 'Presentasi | Coderoach Studio',
  robots: { index: false, follow: false },
  manifest: '/presentasi.webmanifest',
  icons: { icon: '/assets/coderoach_logo.svg' },
};

export const viewport: Viewport = { themeColor: '#08090A' };

export default function PresentasiLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${satoshi.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
