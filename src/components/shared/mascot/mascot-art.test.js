import { describe, expect, it } from 'vitest';

import {
  MASCOT_ART_AVAILABLE,
  MASCOT_ART_DIMENSIONS,
  MASCOT_VARIANTS,
  hasMascotArt,
  mascotArtPath,
} from './mascot-art';

describe('mascot art manifest', () => {
  it('builds a stable public path per variant', () => {
    expect(mascotArtPath('sit')).toBe('/images/mascot/mascot-sit.png');
  });

  it('reports art directly from the available list', () => {
    for (const variant of MASCOT_VARIANTS) {
      expect(hasMascotArt(variant)).toBe(MASCOT_ART_AVAILABLE.includes(variant));
    }
  });

  it('only ever names known variants as available', () => {
    for (const variant of MASCOT_ART_AVAILABLE) {
      expect(MASCOT_VARIANTS).toContain(variant);
    }
  });

  it('declares positive dimensions for available art and none for placeholders', () => {
    expect(Object.keys(MASCOT_ART_DIMENSIONS).sort()).toEqual([...MASCOT_ART_AVAILABLE].sort());

    for (const variant of MASCOT_ART_AVAILABLE) {
      const { width, height } = MASCOT_ART_DIMENSIONS[variant];
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    }

    for (const variant of MASCOT_VARIANTS.filter((name) => !hasMascotArt(name))) {
      expect(MASCOT_ART_DIMENSIONS[variant]).toBeUndefined();
    }
  });
});
