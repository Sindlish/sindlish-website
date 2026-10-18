// The live SEO surface. Everything the inherited template carried for the Neon
// blog (about, blog, guides, categories, RSS, the Postgres canonical hack) is
// gone; only the routes the rebuilt site actually ships remain.

export const DEFAULT_IMAGE_PATH = '/images/og/default.png';
export const SITE_NAME = 'Sindlish';

// The root title template is `%s - Sindlish`; `/` uses this absolute title.
export const DEFAULT_TITLE = 'Sindlish - The First Sindhi Programming Language';
export const DEFAULT_DESCRIPTION =
  'Write code in Sindhi. Sindlish is the first programming language that lets you code using Sindhi keywords, bringing software development to millions of Sindhi speakers.';

// One canonical origin. Preview/branch URLs are never used for canonical links:
// a non-production deployment is noindexed with no canonical at all.
export const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_DEFAULT_SITE_URL || 'https://sindlish.org';

export const isProduction = () =>
  (process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV) === 'production';

export default {
  index: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    pathname: '/',
  },
  docs: {
    title: 'Documentation',
    description: 'Every page in the Sindlish documentation, grouped by pillar.',
    pathname: '/docs',
  },
  creator: {
    title: 'The creator',
    description: 'Who builds Sindlish, read live from GitHub.',
    pathname: '/creator',
  },
  download: {
    title: 'Download',
    description:
      'Install the Sindlish interpreter for Windows, Linux and macOS, then run your first program.',
    pathname: '/download',
  },
  error: {
    title: 'Something went wrong',
  },
  404: {
    title: 'Page not found',
  },
};
