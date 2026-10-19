import { describe, it, expect } from 'vitest';

import { prefersMarkdown, getMarkdownPath, buildAgent404Response } from './ai-agent-detection';

describe('prefersMarkdown', () => {
  // Pure Accept negotiation: no user-agent input at all.
  const createMockRequest = (accept = '') => ({
    headers: new Map([['accept', accept]]),
  });

  it('is true only when Accept includes text/markdown', () => {
    expect(prefersMarkdown(createMockRequest('text/markdown'))).toBe(true);
    expect(prefersMarkdown(createMockRequest('text/markdown, text/html, */*'))).toBe(true);
    expect(prefersMarkdown(createMockRequest('TEXT/MARKDOWN'))).toBe(true);
  });

  it('is false for HTML, wildcard, and non-markdown accepts', () => {
    expect(prefersMarkdown(createMockRequest('text/html'))).toBe(false);
    expect(prefersMarkdown(createMockRequest('text/html,application/json'))).toBe(false);
    expect(prefersMarkdown(createMockRequest('*/*'))).toBe(false);
    expect(prefersMarkdown(createMockRequest('text/plain'))).toBe(false);
    expect(prefersMarkdown(createMockRequest('application/json'))).toBe(false);
    expect(prefersMarkdown(createMockRequest(''))).toBe(false);
  });

  it('never keys off a user-agent, even a known AI one', () => {
    const request = {
      headers: new Map([
        ['user-agent', 'Claude/1.0'],
        ['accept', 'text/html'],
      ]),
    };
    expect(prefersMarkdown(request)).toBe(false);
  });
});

describe('getMarkdownPath', () => {
  describe('Valid content routes', () => {
    it('should convert /docs/introduction to markdown path', () => {
      const result = getMarkdownPath('/docs/introduction');
      expect(result).toBe('/md/docs/introduction.md');
    });

    it('should convert /docs/get-started/installation to markdown path', () => {
      const result = getMarkdownPath('/docs/get-started/installation');
      expect(result).toBe('/md/docs/get-started/installation.md');
    });

    it('should convert /docs/basics/variables to markdown path', () => {
      const result = getMarkdownPath('/docs/basics/variables');
      expect(result).toBe('/md/docs/basics/variables.md');
    });

    it('should handle nested docs paths', () => {
      const result = getMarkdownPath('/docs/reference/keywords');
      expect(result).toBe('/md/docs/reference/keywords.md');
    });
  });

  describe('Non-docs routes (should return null)', () => {
    it('should return null for /postgresql/tutorial', () => {
      const result = getMarkdownPath('/postgresql/tutorial');
      expect(result).toBeNull();
    });

    it('should return null for /guides/neon-sst', () => {
      const result = getMarkdownPath('/guides/neon-sst');
      expect(result).toBeNull();
    });

    it('should return null for /branching/introduction', () => {
      const result = getMarkdownPath('/branching/introduction');
      expect(result).toBeNull();
    });

    it('should return null for /programs/agents', () => {
      const result = getMarkdownPath('/programs/agents');
      expect(result).toBeNull();
    });

    it('should return null for /creator', () => {
      const result = getMarkdownPath('/creator');
      expect(result).toBeNull();
    });

    it('should return null for index pages /guides and /branching', () => {
      expect(getMarkdownPath('/guides')).toBeNull();
      expect(getMarkdownPath('/branching')).toBeNull();
    });

    it('should return null for the /docs/og route handler (no markdown twin)', () => {
      expect(getMarkdownPath('/docs/og')).toBeNull();
      expect(getMarkdownPath('/docs/og/')).toBeNull();
    });
  });

  describe('Custom markdown paths', () => {
    it('should resolve /docs/changelog to custom markdown path', () => {
      const result = getMarkdownPath('/docs/changelog');
      expect(result).toBe('/md/docs/changelog.md');
    });

    it('should resolve /docs/changelog.md to custom markdown path', () => {
      const result = getMarkdownPath('/docs/changelog.md');
      expect(result).toBe('/md/docs/changelog.md');
    });
  });

  describe('Excluded files (should return null)', () => {
    it('should exclude RSS files like /guides/rss.xml', () => {
      const result = getMarkdownPath('/guides/rss.xml');
      expect(result).toBeNull();
    });

    it('should exclude RSS files like /docs/rss.xml', () => {
      const result = getMarkdownPath('/docs/rss.xml');
      expect(result).toBeNull();
    });
  });

  describe('Invalid routes (should return null)', () => {
    it('should return null for non-matching routes like /about', () => {
      const result = getMarkdownPath('/about');
      expect(result).toBeNull();
    });

    it('should return null for root path /', () => {
      const result = getMarkdownPath('/');
      expect(result).toBeNull();
    });

    it('should return null for /pricing', () => {
      const result = getMarkdownPath('/pricing');
      expect(result).toBeNull();
    });

    it('should return null for /multi-tb', () => {
      const result = getMarkdownPath('/multi-tb');
      expect(result).toBeNull();
    });

    it('should return null for /serverless-apps', () => {
      const result = getMarkdownPath('/serverless-apps');
      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle paths with trailing slashes', () => {
      const result = getMarkdownPath('/docs/introduction/');
      expect(result).toBe('/md/docs/introduction.md');
    });

    it('should handle paths with special characters', () => {
      const result = getMarkdownPath('/docs/reference/api-reference');
      expect(result).toBe('/md/docs/reference/api-reference.md');
    });

    it('should not double .md when path already ends with .md', () => {
      const result = getMarkdownPath('/docs/introduction.md');
      expect(result).toBe('/md/docs/introduction.md');
    });

    it('should not double .md for nested paths ending with .md', () => {
      const result = getMarkdownPath('/docs/reference/keywords.md');
      expect(result).toBe('/md/docs/reference/keywords.md');
    });

    it('should return null for /branching.md (no matching route)', () => {
      const result = getMarkdownPath('/branching.md');
      expect(result).toBeNull();
    });

    it('should return null for /guides.md (no matching route)', () => {
      const result = getMarkdownPath('/guides.md');
      expect(result).toBeNull();
    });

    it('should return null for /postgresql.md (no matching route)', () => {
      const result = getMarkdownPath('/postgresql.md');
      expect(result).toBeNull();
    });

    it('should return null for /programs.md (no matching route)', () => {
      const result = getMarkdownPath('/programs.md');
      expect(result).toBeNull();
    });
  });
});

describe('buildAgent404Response', () => {
  it('should include the pathname in the response', () => {
    const result = buildAgent404Response('/docs/manage/nonexistent-page');
    expect(result).toContain('`/docs/manage/nonexistent-page`');
  });

  it('should include links to llms.txt and llms-full.txt', () => {
    const result = buildAgent404Response('/docs/some-page');
    expect(result).toContain('/docs/llms.txt');
    expect(result).toContain('/docs/llms-full.txt');
  });

  it('should mention Sindlish documentation', () => {
    const result = buildAgent404Response('/docs/some-page');
    expect(result).toContain('Sindlish');
  });

  it('should work with deeply nested paths', () => {
    const result = buildAgent404Response('/docs/concepts/deeply/nested/path');
    expect(result).toContain('`/docs/concepts/deeply/nested/path`');
    expect(result).toContain('/docs/llms.txt');
  });
});
