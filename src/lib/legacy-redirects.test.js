import { describe, it, expect } from 'vitest';

import { LEGACY_REDIRECTS, resolveLegacyRedirect } from './legacy-redirects';

describe('legacy redirects', () => {
  it('maps /playground to /workbench with 308 semantics', () => {
    expect(LEGACY_REDIRECTS).toHaveLength(1);
    const rule = LEGACY_REDIRECTS[0];
    expect(rule.source).toBe('/playground');
    expect(rule.destination).toBe('/workbench');
    expect(rule.permanent).toBe(true);
  });

  it('preserves query string when resolving', () => {
    expect(resolveLegacyRedirect('/playground')).toBe('/workbench');
    expect(resolveLegacyRedirect('/playground?code=abc')).toBe('/workbench?code=abc');
    expect(resolveLegacyRedirect('/playground?x=1&y=2')).toBe('/workbench?x=1&y=2');
    expect(resolveLegacyRedirect('/not-playground?x=1')).toBeNull();
  });
});
