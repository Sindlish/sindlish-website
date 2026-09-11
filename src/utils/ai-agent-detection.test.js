import { describe, it, expect } from 'vitest';

import { isAIAgentRequest, getMarkdownPath, buildAgent404Response } from './ai-agent-detection';

describe('isAIAgentRequest', () => {
  // Helper to create mock request objects
  const createMockRequest = (userAgent = '', accept = '') => ({
    headers: new Map([
      ['user-agent', userAgent],
      ['accept', accept],
    ]),
  });

  describe('User-Agent detection', () => {
    const aiAgentPatterns = [
      'ChatGPT-User',
      'OpenAI',
      'GPT',
      'Claude',
      'Anthropic',
      'Cursor',
      'Windsurf',
      'Perplexity',
      'GitHub-Copilot',
      'ai-agent',
      'llm-agent',
      'axios',
      'got',
    ];

    aiAgentPatterns.forEach((pattern) => {
      it(`should detect AI agent with User-Agent containing "${pattern}"`, () => {
        const req = createMockRequest(`Mozilla/5.0 ${pattern}/1.0`, 'text/html');
        expect(isAIAgentRequest(req)).toBe(true);
      });

      it(`should detect AI agent with User-Agent containing lowercase "${pattern.toLowerCase()}"`, () => {
        const req = createMockRequest(`Mozilla/5.0 ${pattern.toLowerCase()}/1.0`, 'text/html');
        expect(isAIAgentRequest(req)).toBe(true);
      });
    });

    it('should not detect regular browser User-Agent', () => {
      const req = createMockRequest(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'text/html'
      );
      expect(isAIAgentRequest(req)).toBe(false);
    });
  });

  describe('Accept header detection', () => {
    it('should detect AI agent when Accept includes text/markdown', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/markdown');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect AI agent when Accept includes text/markdown with text/html', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/markdown, text/html, */*');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect AI agent when Accept is text/plain without text/html', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/plain');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect AI agent when Accept is application/json without text/html', () => {
      const req = createMockRequest('Mozilla/5.0', 'application/json');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect AI agent when Accept is application/xml without text/html', () => {
      const req = createMockRequest('Mozilla/5.0', 'application/xml');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should NOT detect AI agent when Accept includes text/html without markdown', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/html,application/json');
      expect(isAIAgentRequest(req)).toBe(false);
    });

    it('should NOT detect AI agent when Accept is only text/html', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/html');
      expect(isAIAgentRequest(req)).toBe(false);
    });

    it('should NOT detect AI agent with generic Accept header', () => {
      const req = createMockRequest('Mozilla/5.0', '*/*');
      expect(isAIAgentRequest(req)).toBe(false);
    });
  });

  describe('Combined detection', () => {
    it('should detect AI agent with both AI User-Agent and non-HTML Accept', () => {
      const req = createMockRequest('Claude/1.0', 'text/plain');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect AI agent with AI User-Agent even with HTML Accept', () => {
      const req = createMockRequest('Claude/1.0', 'text/html');
      expect(isAIAgentRequest(req)).toBe(true);
    });
  });

  describe('Real-world AI tools detection', () => {
    it('should detect Claude Code with axios User-Agent and text/markdown Accept', () => {
      const req = createMockRequest('axios/1.8.4', 'text/markdown, text/html, */*');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect Cursor with got User-Agent', () => {
      const req = createMockRequest('got (https://github.com/sindresorhus/got)', '*/*');
      expect(isAIAgentRequest(req)).toBe(true);
    });

    it('should detect any tool requesting text/markdown even with regular User-Agent', () => {
      const req = createMockRequest('Mozilla/5.0', 'text/markdown, */*');
      expect(isAIAgentRequest(req)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing User-Agent header', () => {
      const req = createMockRequest('', 'text/html');
      expect(isAIAgentRequest(req)).toBe(false);
    });

    it('should handle missing Accept header', () => {
      const req = createMockRequest('Mozilla/5.0', '');
      expect(isAIAgentRequest(req)).toBe(false);
    });

    it('should handle both headers missing', () => {
      const req = createMockRequest('', '');
      expect(isAIAgentRequest(req)).toBe(false);
    });
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

    it('should return null for /use-cases/ai-agents', () => {
      const result = getMarkdownPath('/use-cases/ai-agents');
      expect(result).toBeNull();
    });

    it('should return null for index pages /guides and /branching', () => {
      expect(getMarkdownPath('/guides')).toBeNull();
      expect(getMarkdownPath('/branching')).toBeNull();
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

    it('should return null for /use-cases/multi-tb', () => {
      const result = getMarkdownPath('/use-cases/multi-tb');
      expect(result).toBeNull();
    });

    it('should return null for /use-cases/serverless-apps', () => {
      const result = getMarkdownPath('/use-cases/serverless-apps');
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
