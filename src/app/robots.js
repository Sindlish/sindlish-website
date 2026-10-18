import { getSiteUrl, isProduction } from 'constants/seo-data';

// Native robots.txt. Production allows the whole site and only keeps `/search`
// out of the index; every other environment (previews, local builds) is fully
// disallowed so a preview can never become canonical.
export const dynamic = 'force-static';

export default function robots() {
  const siteUrl = getSiteUrl();

  if (!isProduction()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/search' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
