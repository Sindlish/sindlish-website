module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_DEFAULT_SITE_URL || 'https://sindlish.org',
  exclude: [
    // API routes
    '/api/*',

    // XML routes (RSS feeds and sitemaps)
    '**/*.xml',

    // Blog pages (handled by blog-sitemap.xml)
    '/blog/*',

    // Legacy docs
    '/docs/auth/legacy/*',
  ],
  generateRobotsTxt: true,
  additionalPaths: async (config) => [await config.transform(config, '/')],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: [
          // Legacy docs
          '/docs/auth/legacy/',
        ],
      },
    ],
    additionalSitemaps: [`${process.env.NEXT_PUBLIC_DEFAULT_SITE_URL}/blog-sitemap.xml`],
  },
};
