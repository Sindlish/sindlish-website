import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Mock next/server - must be set up before the module under test is imported.
vi.mock('next/server', () => ({
  NextResponse: class MockNextResponse extends Response {
    constructor(body, init) {
      super(body, init);
      this.type = 'response';
    }

    static next() {
      return { type: 'next', headers: new Headers() };
    }
  },
}));

// Default fetch is a safe no-op so unrelated tests never hit the network.
global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));

process.env.NEXT_PUBLIC_DEFAULT_SITE_URL = 'https://sindlish.org';

let proxy;

const createMockRequest = (pathname, accept = '', userAgent = 'Mozilla/5.0') => ({
  nextUrl: {
    pathname,
    origin: 'https://sindlish.org',
    href: `https://sindlish.org${pathname}`,
  },
  url: `https://sindlish.org${pathname}`,
  headers: new Map([
    ['accept', accept],
    ['user-agent', userAgent],
  ]),
});

const mockMarkdownFetch = (content = '# Test Markdown') => {
  global.fetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(content) });
};

describe('proxy - markdown twin negotiation', () => {
  beforeAll(async () => {
    ({ proxy } = await import('./proxy.js'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
  });

  it('serves the markdown twin for Accept: text/markdown', async () => {
    mockMarkdownFetch('# Introduction');
    const response = await proxy(createMockRequest('/docs/introduction', 'text/markdown'));

    expect(global.fetch).toHaveBeenCalledWith('https://sindlish.org/md/docs/introduction.md');
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toContain('# Introduction');
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('X-Content-Source')).toBe('markdown');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(response.headers.get('Vary')).toBe('Accept');
    expect(response.headers.get('Link')).toContain('rel="llms-txt"');
    expect(response.headers.get('Link')).toContain('rel="llms-full-txt"');
  });

  it('serves HTML (next) for a plain browser request and still advertises the twins', async () => {
    const response = await proxy(createMockRequest('/docs/introduction', 'text/html'));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(response.type).toBe('next');
    expect(response.headers.get('Link')).toContain('rel="llms-txt"');
  });

  it('does not key off a known AI user-agent when Accept is HTML', async () => {
    const response = await proxy(createMockRequest('/docs/introduction', 'text/html', 'Claude/1.0'));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(response.type).toBe('next');
  });

  it('does not negotiate markdown for */* or text/plain', async () => {
    for (const accept of ['*/*', 'text/plain', 'application/json']) {
      global.fetch.mockClear();
      const response = await proxy(createMockRequest('/docs/introduction', accept));
      expect(global.fetch).not.toHaveBeenCalled();
      expect(response.type).toBe('next');
    }
  });

  it('serves the twin for an explicit .md URL regardless of Accept', async () => {
    mockMarkdownFetch('# Introduction');
    const response = await proxy(createMockRequest('/docs/introduction.md', 'text/html'));

    expect(global.fetch).toHaveBeenCalledWith('https://sindlish.org/md/docs/introduction.md');
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(await response.text()).toContain('# Introduction');
  });

  it('returns an agent-friendly markdown 404 when the twin is missing', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const response = await proxy(createMockRequest('/docs/non-existent', 'text/markdown'));

    expect(response.status).toBe(404);
    expect(response.headers.get('X-Content-Source')).toBe('md-404');
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60, s-maxage=300');
    const text = await response.text();
    expect(text).toContain('/docs/non-existent');
    expect(text).toContain('/docs/llms.txt');
  });

  it('falls back to next() when the twin fetch throws', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    const response = await proxy(createMockRequest('/docs/introduction', 'text/markdown'));

    expect(response.type).toBe('next');
  });

  it('passes through non-page paths (llms.txt, og image) without fetching', async () => {
    for (const path of ['/docs/llms.txt', '/docs/llms-full.txt', '/docs/og']) {
      global.fetch.mockClear();
      const response = await proxy(createMockRequest(path, 'text/markdown'));
      expect(global.fetch).not.toHaveBeenCalled();
      expect(response.type).toBe('next');
      expect(response.headers.get('Link')).toContain('rel="llms-txt"');
    }
  });
});
