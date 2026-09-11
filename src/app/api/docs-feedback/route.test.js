import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body, init) =>
      new Response(JSON.stringify(body), {
        status: init?.status || 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

let GET, POST;

describe('/api/docs-feedback', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch');
    const mod = await import('./route.js');
    GET = mod.GET;
    POST = mod.POST;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeRequest = (body, headers = {}) =>
    new Request('https://sindlish.org/api/docs-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });

  describe('GET', () => {
    it('returns self-documenting JSON with cache header', async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400');

      const json = await res.json();
      expect(json.endpoint).toBe('POST /api/docs-feedback');
      expect(json.body.feedback).toBeDefined();
      expect(json.example).toBeDefined();
    });
  });

  describe('POST — validation', () => {
    it('returns 400 for invalid JSON', async () => {
      const req = new Request('https://sindlish.org/api/docs-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Invalid JSON/i);
    });

    it('returns 400 when feedback is missing', async () => {
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/feedback is required/);
    });

    it('returns 400 when feedback is empty/whitespace', async () => {
      const res = await POST(makeRequest({ feedback: '   ' }));
      expect(res.status).toBe(400);
    });

    it('truncates feedback exceeding max length instead of rejecting', async () => {
      const res = await POST(makeRequest({ feedback: 'x'.repeat(5000) }));
      expect(res.status).toBe(204);
    });

    it('truncates path exceeding max length instead of rejecting', async () => {
      const res = await POST(makeRequest({ feedback: 'test', path: '/docs/' + 'x'.repeat(600) }));
      expect(res.status).toBe(204);
    });

    it('ignores unknown fields without error', async () => {
      const res = await POST(
        makeRequest({ feedback: 'test', category: 'incorrect', source: 'cursor', extra: 'data' })
      );
      expect(res.status).toBe(204);
    });
  });

  describe('POST — success', () => {
    it('returns 204 with minimal payload', async () => {
      const res = await POST(makeRequest({ feedback: 'Something is wrong' }));
      expect(res.status).toBe(204);
    });

    it('returns 204 with path', async () => {
      const res = await POST(
        makeRequest({
          feedback: 'The code example is outdated',
          path: '/docs/basics/variables',
        })
      );
      expect(res.status).toBe(204);
    });

    it('does not fire any external fetch', async () => {
      await POST(
        makeRequest({
          feedback: 'test feedback',
          path: '/docs/basics/variables',
        })
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
