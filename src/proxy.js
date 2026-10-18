import { NextResponse } from 'next/server';

import { getMarkdownPath, buildAgent404Response, prefersMarkdown } from './utils/ai-agent-detection';

// The redesigned LLM surface. A docs URL returns its markdown twin when the
// client negotiated `Accept: text/markdown` (or asked for the explicit `.md`
// URL), with the standard llms.txt Link headers and `X-Robots-Tag: noindex`.
// Without the header the same URL returns HTML. The legacy `/llms/*.txt`
// redirects and the user-agent sniffing are gone.

const TWIN_LINK_HEADERS = [
  ['Link', '</docs/llms.txt>; rel="llms-txt"'],
  ['Link', '</docs/llms-full.txt>; rel="llms-full-txt"'],
];

const appendDiscoveryHeaders = (response) => {
  response.headers.append('Vary', 'Accept');
  for (const [name, value] of TWIN_LINK_HEADERS) {
    response.headers.append(name, value);
  }
  return response;
};

const markdownResponse = (body, { status = 200, source = 'markdown' } = {}) => {
  const response = new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        status === 200 ? 'public, max-age=3600, s-maxage=86400' : 'public, max-age=60, s-maxage=300',
      'X-Content-Source': source,
      'X-Robots-Tag': 'noindex',
    },
  });
  return appendDiscoveryHeaders(response);
};

// A non-.md path with a file extension (e.g. /docs/llms.txt) is not a page:
// never negotiate it, let Next serve the static file. Extensionless non-page
// routes (e.g. /docs/og) are filtered out by `getMarkdownPath` instead.
const hasNonPageExtension = (pathname) => /\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith('.md');

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (hasNonPageExtension(pathname)) {
    return appendDiscoveryHeaders(NextResponse.next());
  }

  const markdownPath = getMarkdownPath(pathname);

  if (markdownPath) {
    const explicitMarkdown = pathname.endsWith('.md');

    if (explicitMarkdown || prefersMarkdown(req)) {
      try {
        const response = await fetch(`${req.nextUrl.origin}${markdownPath}`);

        if (response.ok) {
          return markdownResponse(await response.text());
        }

        if (response.status === 404) {
          return markdownResponse(buildAgent404Response(pathname), { status: 404, source: 'md-404' });
        }
      } catch (error) {
        console.error('[markdown] Failed to serve twin', { pathname, error: error.message });
      }
    }
  }

  // An HTML response still advertises the twins for discovery.
  return appendDiscoveryHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/docs/:path*'],
};
