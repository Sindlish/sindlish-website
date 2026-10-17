/**
 * The rebuild's one legacy URL change (spec #44): `/playground` retires behind
 * a permanent (308) redirect to `/workbench`. The query string is carried across
 * because the rule is path-only, so `?code=` — the workbench share parameter —
 * survives the hop.
 *
 * The rules are plain, mutable objects on purpose: Next.js normalises the
 * objects returned from `redirects()` in place, so freezing them breaks the
 * build ("Cannot assign to read only property 'source'").
 */
const LEGACY_REDIRECTS = [{ source: '/playground', destination: '/workbench', permanent: true }];

/** Pure, testable resolver mirroring how a browser resolves the rules. */
function resolveLegacyRedirect(url) {
  if (typeof url !== 'string') return null;

  const [path, query] = url.split('?');
  const rule = LEGACY_REDIRECTS.find((redirect) => redirect.source === path);
  if (!rule) return null;

  return query ? `${rule.destination}?${query}` : rule.destination;
}

module.exports = { LEGACY_REDIRECTS, resolveLegacyRedirect };
