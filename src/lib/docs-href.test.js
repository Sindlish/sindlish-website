import { describe, it, expect } from 'vitest';

import { rewriteDocsHref } from './docs-href';

describe('rewriteDocsHref', () => {
  it('rewrites /docs paths to basePath', () => {
    expect(rewriteDocsHref('/docs')).toBe('/docs');
    expect(rewriteDocsHref('/docs/intro')).toBe('/docs/intro');
    expect(rewriteDocsHref('/docs/intro', '/workbench/docs')).toBe('/workbench/docs/intro');
    expect(rewriteDocsHref('/docs/intro', '/workbench/docs/')).toBe('/workbench/docs/intro');
    expect(rewriteDocsHref('/docs#top', '/workbench/docs')).toBe('/workbench/docs#top');
  });
});
