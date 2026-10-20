import { getSiteUrl } from 'constants/seo-data';
import { getAllPosts } from 'utils/api-docs';
import { getDocsSourceLastModified } from 'utils/file-last-modified';

// Native sitemap. The route inventory is explicit: `/`, the `/docs` index, every
// real docs page, `/download` and `/creator`. `/search`, `/workbench` and the
// workbench docs pane are noindex and never listed, and `/playground` is a 308
// to `/workbench`.
//
// `lastmod` is deterministic: it is the owning content file's last commit date,
// never `new Date()`.
export const dynamic = 'force-static';

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const absolute = (pathname) => new URL(pathname, siteUrl).toString();

  const posts = await getAllPosts();
  const docsPages = posts
    .filter((post) => post && !post.noindex && !post.isDraft)
    .map((post) => ({
      url: absolute(`/docs/${post.slug}`),
      lastModified: getDocsSourceLastModified(post.slug),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [
    { url: absolute('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absolute('/docs'), changeFrequency: 'weekly', priority: 0.9 },
    ...docsPages,
    { url: absolute('/download'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absolute('/creator'), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
