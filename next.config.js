const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { CONTENT_ROUTES } = require('./src/constants/content');
const { getAllPosts } = require('./src/utils/api-docs');
const generateDocPagePath = require('./src/utils/generate-doc-page-path');

const defaultConfig = {
  poweredByHeader: false,
  transpilePackages: ['geist', 'react-icons'],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95, 99, 100],
    localPatterns: [
      {
        pathname: '/docs/og',
      },
      {
        pathname: '/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=0, s-maxage=31536000',
          },
        ],
      },
      {
        source: '/fonts/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
      {
        source: '/animations/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/videos/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/docs/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/images/technology-logos/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/blog/parsing-json-from-postgres-in-js',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/(docs)/:path*.md',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
          {
            key: 'Content-Type',
            value: 'text/markdown; charset=utf-8',
          },
        ],
      },
    ];
  },
  async redirects() {
    const docPosts = await getAllPosts();
    const docsRedirects = docPosts.filter(Boolean).reduce((acc, post) => {
      const { slug, redirectFrom: postRedirects } = post;
      if (!postRedirects || !postRedirects.length) {
        return acc;
      }

      const postRedirectsArray = postRedirects.map((redirect) => ({
        source: redirect,
        destination: generateDocPagePath(slug),
        permanent: true,
      }));

      return [...acc, ...postRedirectsArray];
    }, []);

    return [
      {
        source: '/docs/get-started-with-neon/:path*',
        destination: '/docs/get-started/:path*',
        permanent: true,
      },
      {
        source: '/bm',
        destination: '/?ref=tbm-p',
        permanent: true,
      },
      {
        source: '/burningmonk',
        destination: '/?ref=tbm-p',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: 'https://www.databricks.com/legal/privacynotice',
        permanent: true,
      },
      {
        source: '/privacy-guide',
        destination: 'https://www.databricks.com/legal/privacynotice',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/platform-terms',
        permanent: true,
      },
      {
        source: '/dpa',
        destination: '/platform-terms#3.4',
        permanent: true,
      },
      {
        source: '/sensitive-data-terms',
        destination: 'https://www.databricks.com/legal/terms-of-use',
        permanent: true,
      },
      {
        source: '/team',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: 'https://www.databricks.com/company/careers',
        permanent: true,
      },
      {
        source: '/careers',
        destination: 'https://www.databricks.com/company/careers',
        permanent: true,
      },
      {
        source: '/msa',
        destination: '/platform-terms',
        permanent: true,
      },
      ...docsRedirects,
    ];
  },
  async rewrites() {
    // Generate rewrites for AI agent markdown access
    // Maps /docs/x.md → /md/docs/x.md (internal public/md/ directory)
    const contentRewrites = Object.keys(CONTENT_ROUTES).map((route) => ({
      source: `/${route}/:path*.md`,
      destination: `/md/${route}/:path*.md`,
    }));

    // /:path*.md above requires at least one segment after the route name;
    // explicit index rewrites handle root .md routes.
    const indexRewrites = Object.keys(CONTENT_ROUTES)
      .filter((route) => !route.includes('/'))
      .map((route) => ({
        source: `/${route}.md`,
        destination: `/md/${route}.md`,
      }));

    return {
      // beforeFiles: serve static files from public/docs/ before the
      // docs/[...slug] catch-all intercepts them
      beforeFiles: [
        { source: '/docs/:path*/llms.txt', destination: '/docs/:path*/llms.txt' },
        { source: '/docs/llms-full.txt', destination: '/docs/llms-full.txt' },
      ],
      // afterFiles: runs after checking pages/public files but before dynamic routes
      // This ensures physical .md files are served first, with fallback to public/md/
      afterFiles: [
        // Serve /llms.txt and /llms-full.txt from /docs/ (canonical location is public/docs/)
        { source: '/llms.txt', destination: '/docs/llms.txt' },
        { source: '/llms-full.txt', destination: '/docs/llms-full.txt' },
        ...indexRewrites,
        ...contentRewrites,
      ],
      // fallback: existing rewrites for external services
      fallback: [
        {
          source: '/api_spec/release/v2.json',
          destination: 'https://dfv3qgd2ykmrx.cloudfront.net/api_spec/release/v2.json',
        },
        {
          source: '/demos/ping-thing',
          destination: 'https://ping-thing.vercel.app/demos/ping-thing',
        },
        {
          source: '/demos/ping-thing/:path*',
          destination: 'https://ping-thing.vercel.app/demos/ping-thing/:path*',
        },
        {
          source: '/demos/regional-latency',
          destination: 'https://latency-benchmarks-dashboard.vercel.app/demos/regional-latency',
        },
        {
          source: '/demos/regional-latency/:path*',
          destination:
            'https://latency-benchmarks-dashboard.vercel.app/demos/regional-latency/:path*',
        },
        {
          source: '/ai-chat',
          destination: '/docs/introduction#ai-chat',
        },
      ],
    };
  },
  turbopack: {
    root: __dirname,
    rules: {
      '*.inline.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                  'prefixIds',
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
    resolveAlias: {
      fs: { browser: './empty.js' },
      module: { browser: './empty.js' },
      path: { browser: './empty.js' },
      crypto: { browser: './empty.js' },
      stream: { browser: './empty.js' },
      assert: { browser: './empty.js' },
      http: { browser: './empty.js' },
      https: { browser: './empty.js' },
      os: { browser: './empty.js' },
      url: { browser: './empty.js' },
    },
  },
  env: {
    INKEEP_INTEGRATION_API_KEY: process.env.INKEEP_INTEGRATION_API_KEY,
    INKEEP_INTEGRATION_ID: process.env.INKEEP_INTEGRATION_ID,
    INKEEP_ORGANIZATION_ID: process.env.INKEEP_ORGANIZATION_ID,
  },
};

module.exports = withBundleAnalyzer(defaultConfig);
