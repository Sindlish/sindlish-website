import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  MASCOT_ART_AVAILABLE,
  MASCOT_ART_DIMENSIONS,
  MASCOT_VARIANTS,
} from 'components/shared/mascot/mascot-art';
import getMetadata from 'utils/get-metadata';

/*
 * The identity contract #49 hands to T10: the favicon set, the manifest, the
 * default social image and the mascot art all exist where the shell and the
 * metadata say they do, and `MASCOT_ART_AVAILABLE` only names files that are
 * really on disk. Everything is read straight from `public/`, so the test can
 * only pass by being correct about the repo the site actually ships.
 *
 * PNG and ICO headers are parsed by hand on purpose: the test proves the bytes
 * are right without leaning on the generator that produced them.
 */

if (!process.env.NEXT_PUBLIC_DEFAULT_SITE_URL) {
  process.env.NEXT_PUBLIC_DEFAULT_SITE_URL = 'http://localhost:3000';
}

const PUBLIC = path.resolve(process.cwd(), 'public');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const readPublic = (relativePath) => {
  const filePath = path.join(PUBLIC, relativePath);
  return { filePath, buffer: readFileSync(filePath) };
};

const pngSize = (buffer) => {
  expect(buffer.subarray(0, 8).equals(PNG_SIGNATURE), 'not a PNG').toBe(true);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

/** Width of every frame in a .ico, in the order they are packed. */
const icoFrameSizes = (buffer) => {
  expect(buffer.readUInt16LE(2), 'not an icon').toBe(1);
  const count = buffer.readUInt16LE(4);
  return Array.from({ length: count }, (_, index) => buffer[6 + index * 16] || 256);
};

/** The raster identity set at the public root, all raster and transparent. */
const ICON_SPECS = [
  ['favicon-16x16.png', 16, 16],
  ['favicon-32x32.png', 32, 32],
  ['apple-touch-icon.png', 180, 180],
  ['icon-192.png', 192, 192],
  ['icon-512.png', 512, 512],
  ['maskable-512.png', 512, 512],
];

describe('identity asset set', () => {
  it('ships every favicon and PWA icon at its exact public path and size', () => {
    for (const [name, width, height] of ICON_SPECS) {
      const { buffer } = readPublic(name);
      expect(pngSize(buffer), name).toEqual({ width, height });
    }
  });

  it('bundles a favicon.ico carrying the 16, 32 and 48 pixel frames', () => {
    const { buffer } = readPublic('favicon.ico');
    expect(icoFrameSizes(buffer).sort((a, b) => a - b)).toEqual([16, 32, 48]);
  });

  it('ships the default social image at 1200x630', () => {
    const { buffer } = readPublic(path.join('images', 'og', 'default.png'));
    expect(pngSize(buffer)).toEqual({ width: 1200, height: 630 });
  });

  it('keeps the generated set regenerable rather than hand-exported', () => {
    expect(existsSync(path.resolve(process.cwd(), 'scripts/generate-identity-assets.js'))).toBe(
      true
    );
    expect(readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')).toContain(
      '"gen:assets"'
    );
  });
});

describe('manifest', () => {
  const manifest = JSON.parse(readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf8'));

  it('uses the re-tokenised display, colours and language', () => {
    expect(manifest.display).toBe('browser');
    expect(manifest.theme_color).toBe('#E02424');
    expect(manifest.background_color).toBe('#000000');
    expect(manifest.lang).toBe('en');
  });

  it('declares the 192, 512 and maskable-512 icons that really exist', () => {
    expect(manifest.icons).toEqual([
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ]);

    for (const icon of manifest.icons) {
      const [width, height] = icon.sizes.split('x').map(Number);
      const { buffer } = readPublic(icon.src.slice(1));
      expect(pngSize(buffer), icon.src).toEqual({ width, height });
    }
  });
});

describe('metadata references', () => {
  const metadata = getMetadata({ title: 'Test', description: 'Test', pathname: '/' });

  it('points every icon at a file on disk', () => {
    const urls = [
      ...metadata.icons.icon.map(({ url }) => url),
      ...metadata.icons.apple.map(({ url }) => url),
    ];

    expect(urls).toEqual([
      '/favicon-16x16.png',
      '/favicon-32x32.png',
      '/favicon.ico',
      '/apple-touch-icon.png',
    ]);

    for (const url of urls) {
      expect(existsSync(path.join(PUBLIC, url.slice(1))), url).toBe(true);
    }
    expect(existsSync(path.join(PUBLIC, 'manifest.json')), metadata.manifest).toBe(true);
  });

  it('falls back to the default social image that ships with the site', () => {
    const { openGraph } = metadata;
    const [image] = openGraph.images;
    const imagePath = new URL(image.url).pathname;

    expect(imagePath).toBe('/images/og/default.png');
    expect(existsSync(path.join(PUBLIC, imagePath.slice(1)))).toBe(true);
  });
});

describe('mascot art honesty', () => {
  const MASCOT_DIR = path.join(PUBLIC, 'images', 'mascot');

  it('has art on disk for every variant it claims is available', () => {
    expect(MASCOT_ART_AVAILABLE.length).toBeGreaterThan(0);

    for (const variant of MASCOT_ART_AVAILABLE) {
      const filePath = path.join(MASCOT_DIR, `mascot-${variant}.png`);
      expect(existsSync(filePath), `missing art for ${variant}`).toBe(true);
      expect(readFileSync(filePath).length).toBeGreaterThan(0);
    }
  });

  it('keeps the master reference alongside the variants', () => {
    expect(existsSync(path.join(MASCOT_DIR, 'mascot-reference.png'))).toBe(true);
  });

  it('declares the intrinsic size each variant really ships', () => {
    for (const variant of MASCOT_ART_AVAILABLE) {
      const { buffer } = readPublic(path.join('images', 'mascot', `mascot-${variant}.png`));
      expect(MASCOT_ART_DIMENSIONS[variant], `dimensions for ${variant}`).toEqual(pngSize(buffer));
    }
  });

  it('never ships a mascot file for a variant the site does not know', () => {
    const orphaned = readdirSync(MASCOT_DIR)
      .filter((file) => file.startsWith('mascot-') && file !== 'mascot-reference.png')
      .map((file) => file.replace(/^mascot-/, '').replace(/\.png$/, ''))
      .filter((variant) => !MASCOT_VARIANTS.includes(variant));

    expect(orphaned, orphaned.join('\n')).toEqual([]);
  });
});
