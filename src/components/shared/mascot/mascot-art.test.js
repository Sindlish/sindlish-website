import { describe, expect, it } from 'vitest';

import {
  MASCOT_ART_AVAILABLE,
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
});
