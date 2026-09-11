import { NextResponse } from 'next/server';

import { CONTENT_ROUTES } from 'constants/content';

import {
  isAIAgentRequest,
  getMarkdownPath,
  buildAgent404Response,
} from './utils/ai-agent-detection';
import llmsRedirectMap from './utils/llms-redirect-map.json';

const SITE_URL =
  process.env.VERCEL_ENV === 'preview'
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.NEXT_PUBLIC_DEFAULT_SITE_URL;

function isContentRoute(pathname) {
  const path = pathname.slice(1).replace(/\/$/, '');
  const normalized = path.endsWith('.md') ? path.slice(0, -3) : path;
  return Object.keys(CONTENT_ROUTES).some(
    (route) => normalized === route || path.startsWith(`${route}/`)
  );
}

function applyDocHeaders(response) {
  response.headers.append('Vary', 'Accept');
  response.headers.set('X-LLMs-Txt', '/docs/llms.txt');
  response.headers.append('Link', '</docs/llms.txt>; rel="llms-txt"');
  response.headers.append('Link', '</docs/llms-full.txt>; rel="llms-full-txt"');
  return response;
}

export async function proxy(req) {
  try {
    const { pathname } = req.nextUrl;

    // Legacy /llms/*.txt redirect (deprecated URLs -> canonical .md URLs)
    if (pathname.startsWith('/llms/')) {
      const filename = pathname.replace('/llms/', '');
      const target = llmsRedirectMap[filename];
      if (target) {
        return NextResponse.redirect(new URL(target, req.url), { status: 301 });
      }
      // No match in map = fall through to 404 naturally
    }

    if (isAIAgentRequest(req)) {
      let agentHit404 = false;
      const markdownPath = getMarkdownPath(pathname);

      if (markdownPath) {
        try {
          const markdownUrl = `${req.nextUrl.origin}${markdownPath}`;
          const response = await fetch(markdownUrl);

          if (response.ok) {
            const markdown = await response.text();
            return applyDocHeaders(
              new NextResponse(markdown, {
                status: 200,
                headers: {
                  'Content-Type': 'text/markdown; charset=utf-8',
                  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                  'X-Content-Source': 'markdown',
                  'X-Robots-Tag': 'noindex',
                },
              })
            );
          }
          agentHit404 = response.status === 404;
          if (!agentHit404) {
            console.error('[AI Agent] Failed to fetch markdown', {
              pathname,
              markdownPath,
              status: response.status,
            });
          }
        } catch (error) {
          console.error('[AI Agent] Error serving markdown', { pathname, error: error.message });
        }
      }

      if (agentHit404) {
        return applyDocHeaders(
          new NextResponse(buildAgent404Response(pathname), {
            status: 404,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Cache-Control': 'public, max-age=60, s-maxage=300',
              'X-Content-Source': 'agent-404',
              'X-Robots-Tag': 'noindex',
            },
          })
        );
      }
    }

    // Apply doc headers to all content route responses (.md URLs and HTML pages).
    // Vary: Accept is only set on markdown-negotiated responses (applyDocHeaders above).
    if (isContentRoute(pathname)) {
      if (pathname.endsWith('.md')) {
        const markdownPath = getMarkdownPath(pathname);

        if (markdownPath) {
          try {
            const markdownUrl = `${req.nextUrl.origin}${markdownPath}`;
            const response = await fetch(markdownUrl);

            if (response.ok) {
              const markdown = await response.text();
              return applyDocHeaders(
                new NextResponse(markdown, {
                  status: 200,
                  headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                    'X-Content-Source': 'markdown',
                    'X-Robots-Tag': 'noindex',
                  },
                })
              );
            }

            if (response.status === 404) {
              return applyDocHeaders(
                new NextResponse(buildAgent404Response(pathname), {
                  status: 404,
                  headers: {
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'public, max-age=60, s-maxage=300',
                    'X-Content-Source': 'md-404',
                    'X-Robots-Tag': 'noindex',
                  },
                })
              );
            }
          } catch (error) {
            console.error('[.md] Error serving markdown', { pathname, error: error.message });
          }
        }
      }

      const response = NextResponse.next();
      response.headers.set('X-LLMs-Txt', '/docs/llms.txt');
      response.headers.append('Link', '</docs/llms.txt>; rel="llms-txt"');
      response.headers.append('Link', '</docs/llms-full.txt>; rel="llms-full-txt"');
      if (pathname.endsWith('.md')) {
        response.headers.set('X-Robots-Tag', 'noindex');
      }
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware execution error:', error);
    // General error fallback
    return NextResponse.redirect(new URL(SITE_URL));
  }
}

export const config = {
  matcher: [
    '/llms/:path*', // Legacy .txt redirect
    '/(docs)/:path*', // All markdown routes
    '/:path(docs).md', // Top-level .md index URLs
  ],
};
