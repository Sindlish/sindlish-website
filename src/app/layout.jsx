import 'styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { GeistMono } from 'geist/font/mono';

import JsonLd from 'components/shared/json-ld';
import SkipLink from 'components/shared/skip-link';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE_PATH,
  DEFAULT_TITLE,
  getSiteUrl,
  isProduction,
  SITE_NAME,
} from 'constants/seo-data';
import { CodeTabsProvider } from 'contexts/code-tabs-context';
import { TabsProvider } from 'contexts/tabs-context';
import { TopbarProvider } from 'contexts/topbar-context';
import { getSiteStructuredData } from 'lib/schema';

import { inter } from './fonts';
import MotionProvider from './motion-provider';
import ThemeProvider from './theme-provider';

export const preferredRegion = 'edge';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// One root metadata object: the single canonical origin, the one title template
// `%s - Sindlish` (pages set a plain title; `/` sets an absolute one), and the
// default OpenGraph/Twitter card pointing at the shared OG image. Non-production
// deployments are noindexed here and by `buildMetadata` on every page.
const siteUrl = getSiteUrl();
const indexable = isProduction();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: `%s - ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  robots: { index: indexable, follow: indexable },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_IMAGE_PATH, width: 1200, height: 630, type: 'image/png', alt: SITE_NAME }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE_PATH],
  },
};

// Fonts are self-hosted through next/font (`--font-inter`, `--font-geist-mono`)
// and referenced once by the token layer. The theme class is set client-side by
// next-themes (defaultTheme="system"); suppressHydrationWarning covers the
// server/client mismatch. No hardcoded theme class, no Google Fonts <link>.
// eslint-disable-next-line react/prop-types
const RootLayout = ({ children }) => (
  <html lang="en" className={`${inter.variable} ${GeistMono.variable}`} suppressHydrationWarning>
    <body>
      <JsonLd id="site-json-ld" data={getSiteStructuredData(siteUrl)} />
      <SkipLink />
      <ThemeProvider>
        <TopbarProvider>
          <TabsProvider>
            <CodeTabsProvider>
              <MotionProvider>{children}</MotionProvider>
            </CodeTabsProvider>
          </TabsProvider>
        </TopbarProvider>
      </ThemeProvider>
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
