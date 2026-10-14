import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import { getPayload } from 'payload';
import config from '@payload-config';
import '../globals.css';
import { ToastProvider } from './_components/ui/Toast';
import { Analytics } from './_components/Analytics';

const satoshi = localFont({
  src: '../../../public/fonts/Satoshi-Variable.ttf',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});

// Media URLs are relative (/api/media/file/...). Without a base, Next resolved og:image against
// localhost, so every shared project link previewed without its image.
const metadataBase = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000');

export async function generateMetadata(): Promise<Metadata> {
  const fallbackName = process.env.NEXT_PUBLIC_SITE_NAME || 'Studio';
  const fallbackDescription =
    'A small dev studio. We build, automate, and ship intelligence, from company sites to internal tools.';
  try {
    const payload = await getPayload({ config });
    const [siteSettings, hero] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings', depth: 1 }).catch(() => null) as Promise<any>,
      payload.findGlobal({ slug: 'hero', depth: 0 }).catch(() => null) as Promise<any>,
    ]);
    const siteName = siteSettings?.siteName || fallbackName;
    const tagline = hero?.headline
      ? `${hero.headline.lead ?? ''} ${hero.headline.accent ?? ''}`.trim()
      : '';
    const description =
      siteSettings?.siteDescription || tagline || fallbackDescription;
    const title = tagline ? `${siteName} · ${tagline}` : siteName;
    const faviconUrl = siteSettings?.favicon?.url;
    const ogImageUrl = siteSettings?.ogImage?.url;
    return {
      metadataBase,
      title,
      description,
      icons: faviconUrl ? { icon: faviconUrl } : { icon: '/assets/coderoach_logo.svg' },
      openGraph: {
        title,
        description,
        siteName,
        ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
      },
    };
  } catch {
    return {
      metadataBase,
      title: fallbackName,
      description: fallbackDescription,
      icons: { icon: '/assets/coderoach_logo.svg' },
    };
  }
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${satoshi.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
