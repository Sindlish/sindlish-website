import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE_PATH,
  getSiteUrl,
  isProduction,
  SITE_NAME,
} from 'constants/seo-data';

// One canonical URL scheme for the whole site.
//
// - `metadataBase` is always the single canonical origin (`NEXT_PUBLIC_DEFAULT_SITE_URL`).
//   A preview/branch URL is never used: previews are noindexed with no canonical.
// - `canonical` is `metadataBase + pathname`, emitted only in production.
// - The root title template (`%s - Sindlish`) is declared once in the root layout;
//   `title` here is a plain page title unless the caller passes `{ absolute }`.
// - Docs descriptions come from the authored `summary` frontmatter; there is no
//   excerpt generator.
// - Docs keep the dynamic `/docs/og` card; every other route uses the one default
//   image slot, `public/images/og/default.png` (1200x630, PNG).

const toAbsoluteUrl = (path, siteUrl) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return new URL(path, siteUrl).toString();
};

function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = '/',
  imagePath = DEFAULT_IMAGE_PATH,
  type = 'website',
  publishedTime = null,
  modifiedTime = null,
  authors = null,
  markdownPath = null,
  noindex = false,
} = {}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(pathname, siteUrl);
  const imageUrl = toAbsoluteUrl(imagePath, siteUrl);
  const indexable = isProduction() && !noindex;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: indexable ? canonicalUrl : undefined,
      types: markdownPath ? { 'text/markdown': toAbsoluteUrl(markdownPath, siteUrl) } : undefined,
    },
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
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: SITE_NAME,
        },
      ],
      type,
      publishedTime,
      modifiedTime,
      authors,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default buildMetadata;
