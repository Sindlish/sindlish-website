import 'styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { GeistMono } from 'geist/font/mono';

import { CodeTabsProvider } from 'contexts/code-tabs-context';
import { TabsProvider } from 'contexts/tabs-context';
import { TopbarProvider } from 'contexts/topbar-context';

import { inter, esbuild } from './fonts';
import ThemeProvider from './theme-provider';

export const preferredRegion = 'edge';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Theme class set client-side by next-themes; suppressHydrationWarning avoids server/client mismatch.
// eslint-disable-next-line react/prop-types
const RootLayout = ({ children }) => (
  <html
    lang="en"
    className={`${inter.variable} ${esbuild.variable} ${GeistMono.variable} dark`}
    suppressHydrationWarning
  >
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap"
        rel="stylesheet"
      />
      <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
    </head>
    <body>
      <ThemeProvider>
        <TopbarProvider>
          <TabsProvider>
            <CodeTabsProvider>{children}</CodeTabsProvider>
          </TabsProvider>
        </TopbarProvider>
      </ThemeProvider>
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
