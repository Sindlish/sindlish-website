import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/*
 * Proves the accessibility claim the token layer makes: every text tier is
 * legible against every surface, in both modes. It reads the real tokens from
 * tokens.css, so a value can only pass the spec by being correct in the file
 * the site actually ships.
 */

const tokensCss = readFileSync(path.resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const BRAND_RED = '#e02424';

/** Parse `--color-*` declarations into { name: { light, dark } }. */
const parseColorTokens = (css) => {
  const tokens = {};
  const re =
    /--color-([a-z0-9-]+):\s*(?:light-dark\(\s*(#[0-9a-f]{3,8})\s*,\s*(#[0-9a-f]{3,8})\s*\)|(#[0-9a-f]{3,8}))\s*;/gi;
  let match = re.exec(css);
  while (match !== null) {
    const [, name, pairLight, pairDark, single] = match;
    tokens[name] = {
      light: (pairLight ?? single).toLowerCase(),
      dark: (pairDark ?? single).toLowerCase(),
      isPair: Boolean(pairLight),
    };
    match = re.exec(css);
  }
  return tokens;
};

const expandHex = (hex) => {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return h.slice(0, 6);
};

const channelToLinear = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (hex) => {
  const h = expandHex(hex);
  const r = channelToLinear(parseInt(h.slice(0, 2), 16));
  const g = channelToLinear(parseInt(h.slice(2, 4), 16));
  const b = channelToLinear(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

const tokens = parseColorTokens(tokensCss);

const SURFACES = ['surface-page', 'surface-raised', 'surface-overlay'];

// Normal-text tiers that appear on any surface, checked at the AA 4.5:1 bar.
const TEXT_TIERS = [
  'text-primary',
  'text-secondary',
  'text-muted',
  'link',
  'link-hover',
  'ok',
  'err',
];

describe('token layer', () => {
  it('declares each colour token once with light-dark(), never with a .dark override', () => {
    expect(tokensCss).not.toMatch(/\.dark\s*\{[^}]*--color-/);
    SURFACES.forEach((surface) => {
      expect(tokens[surface]?.isPair, `${surface} must be a light-dark() pair`).toBe(true);
    });
    TEXT_TIERS.forEach((tier) => {
      expect(tokens[tier]?.isPair, `${tier} must be a light-dark() pair`).toBe(true);
    });
  });

  it('uses a pure black page surface in dark mode', () => {
    expect(tokens['surface-page'].dark).toBe('#000000');
  });

  it('keeps every text tier at WCAG 2.2 AA (>= 4.5:1) against all three surfaces', () => {
    const failures = [];
    TEXT_TIERS.forEach((tier) => {
      ['light', 'dark'].forEach((mode) => {
        const fg = tokens[tier][mode];
        SURFACES.forEach((surface) => {
          const bg = tokens[surface][mode];
          const ratio = contrastRatio(fg, bg);
          if (ratio < 4.5) {
            failures.push(`${tier} (${mode}) on ${surface}: ${ratio.toFixed(2)}:1`);
          }
        });
      });
    });
    expect(failures, failures.join('\n')).toEqual([]);
  });

  it('reserves brand red and never uses it as text or a link', () => {
    expect(tokens.brand.light).toBe(BRAND_RED);
    expect(tokens.brand.dark).toBe(BRAND_RED);
    TEXT_TIERS.forEach((tier) => {
      expect(tokens[tier].light, `${tier} must not be brand red`).not.toBe(BRAND_RED);
      expect(tokens[tier].dark, `${tier} must not be brand red`).not.toBe(BRAND_RED);
    });
  });
});
