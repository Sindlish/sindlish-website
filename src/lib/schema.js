// Structured data builders. The site publishes one JSON-LD graph site-wide
// (WebSite + SearchAction + Organization), a Person on /creator, and an Article
// on each docs page. Everything is derived from the canonical origin so previews
// and production agree on the shape.

export const getSiteStructuredData = (siteUrl) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Sindlish',
      description:
        'Sindlish is the first programming language that lets you code using Sindhi keywords.',
      inLanguage: 'en',
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Sindlish',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/og/default.png`,
      },
      sameAs: ['https://github.com/Sindlish/Sindlish'],
    },
  ],
});

export const getPersonSchema = (siteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Amanat Ali Panhwer',
  url: `${siteUrl}/creator`,
  sameAs: ['https://github.com/AmanatAliPanhwer'],
});

export const getArticleSchema = ({ siteUrl, title, description, pathname, imagePath, dateModified }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'en',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}${pathname}`,
  },
  image: imagePath.startsWith('http') ? imagePath : `${siteUrl}${imagePath}`,
  ...(dateModified ? { dateModified } : {}),
  author: { '@type': 'Organization', name: 'Sindlish Team' },
  publisher: { '@id': `${siteUrl}/#organization` },
});
