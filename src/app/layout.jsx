import 'styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { GeistMono } from 'geist/font/mono';

import SkipLink from 'components/shared/skip-link';
import { CodeTabsProvider } from 'contexts/code-tabs-context';
import { TabsProvider } from 'contexts/tabs-context';
import { TopbarProvider } from 'contexts/topbar-context';

import { inter } from './fonts';
import MotionProvider from './motion-provider';
import ThemeProvider from './theme-provider';

export const preferredRegion = 'edge';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Fonts are self-hosted through next/font (`--font-inter`, `--font-geist-mono`)
// and referenced once by the token layer. The theme class is set client-side by
// next-themes (defaultTheme="system"); suppressHydrationWarning covers the
// server/client mismatch. No hardcoded theme class, no Google Fonts <link>.
// eslint-disable-next-line react/prop-types
const RootLayout = ({ children }) => (
  <html lang="en" className={`${inter.variable} ${GeistMono.variable}`} suppressHydrationWarning>
    <head>
      <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
    </head>
    <body>
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
