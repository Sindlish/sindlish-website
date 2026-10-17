/**
 * Generate the site's raster identity set.
 *
 * Re-runnable on purpose: every PNG served from the public root (the favicon
 * set, the PWA icons, the maskable icon), the bundled `favicon.ico` and the
 * default social image at `public/images/og/default.png` are all derived here.
 * When the dedicated `mascot-icon` art lands, repoint `ICON_SOURCE` at it and
 * run the script again — nothing else has to change.
 *
 *   node scripts/generate-identity-assets.js
 *   npm run gen:assets
 *
 * Sources
 *   - `ICON_SOURCE`  the mark the favicon set is rasterised from.
 *   - `OG_MASCOT`    the mascot composited into the default social image.
 *
 * Rules
 *   - Raster only: no SVG favicon ships.
 *   - Transparent background for every icon (the manifest supplies the
 *     maskable/icon backing colour via `background_color`).
 *   - Only art that exists in the repo is used; nothing is synthesised here.
 */

const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { dirname, resolve } = require('path');

const pngToIco = require('png-to-ico');
const sharp = require('sharp');

// Run from the package root (that is what `npm run gen:assets` does).
const ROOT = resolve(process.cwd());
const PUBLIC = resolve(ROOT, 'public');

/** INTERIM: the dedicated mascot icon art has not landed, so the brand glyph stands in. */
const ICON_SOURCE = resolve(PUBLIC, 'images/sindlish-logo.svg');
const OG_MASCOT = resolve(PUBLIC, 'images/mascot/mascot-standing-neutral.png');
const OG_OUT = resolve(PUBLIC, 'images/og/default.png');

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };

const BRAND_RED = '#E02424';
const OG = { width: 1200, height: 630 };
const MASCOT_OG_HEIGHT = 560;

/**
 * Icon sizes with the share of the square the mark is allowed to occupy.
 * The maskable entry stays inside the maskable safe zone (a centred circle of
 * 40% radius), which means the mark's half diagonal must fit in 0.4 * size.
 */
const ICONS = [
  ['favicon-16x16.png', 16, 0.95],
  ['favicon-32x32.png', 32, 0.95],
  ['apple-touch-icon.png', 180, 0.85],
  ['icon-192.png', 192, 0.85],
  ['icon-512.png', 512, 0.85],
  ['maskable-512.png', 512, 0.55],
];

/** favicon.ico must carry 16, 32 and 48 pixel frames. */
const ICO_SIZES = [48, 32, 16];
const ICO_COVER = 0.95;

const FONT_STACK =
  "'Segoe UI', 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Geeza Pro', Arial, system-ui, sans-serif";

const requireExists = (filePath, hint) => {
  if (!existsSync(filePath)) {
    throw new Error(`Missing source art: ${filePath} (${hint})`);
  }
};

/** The mark cropped to its ink, so every size can be placed at an exact coverage. */
async function loadMark() {
  requireExists(ICON_SOURCE, 'interim favicon source');

  const rendered = await sharp(ICON_SOURCE, { density: 300 })
    .resize(2048, 2048, { fit: 'contain', background: CLEAR })
    .ensureAlpha()
    .png()
    .toBuffer();

  const { data, info } = await sharp(rendered).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < 0) {
    throw new Error(`Interim icon source rendered nothing: ${ICON_SOURCE}`);
  }

  return sharp(rendered)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer();
}

/** Transparent square of `size` px holding the mark at `coverage` of its edge. */
async function renderIcon(mark, size, coverage) {
  const extent = Math.max(1, Math.round(size * coverage));
  const glyph = await sharp(mark)
    .resize(extent, extent, { fit: 'contain', background: CLEAR })
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: CLEAR } })
    .composite([{ input: glyph, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function writeFaviconSet(mark) {
  const frames = new Map();

  for (const [name, size, coverage] of ICONS) {
    const buf = await renderIcon(mark, size, coverage);
    writeFileSync(resolve(PUBLIC, name), buf);
    frames.set(size, buf);
    console.log(`  ${name} ${size}x${size}`);
  }

  for (const size of ICO_SIZES) {
    if (!frames.has(size)) {
      frames.set(size, await renderIcon(mark, size, ICO_COVER));
    }
  }

  const ico = await pngToIco(ICO_SIZES.map((size) => frames.get(size)));
  writeFileSync(resolve(PUBLIC, 'favicon.ico'), ico);
  console.log(`  favicon.ico (${ICO_SIZES.join('/')})`);
}

/** The default social image: Sindhi + Roman lockup, tagline, mascot on black. */
async function writeDefaultOg() {
  requireExists(OG_MASCOT, 'OG mascot');

  mkdirSync(dirname(OG_OUT), { recursive: true });

  const mascot = await sharp(OG_MASCOT)
    .resize({ height: MASCOT_OG_HEIGHT, fit: 'contain', background: CLEAR })
    .png()
    .toBuffer();
  const mascotBox = await sharp(mascot).metadata();

  const mascotLeft = Math.max(0, OG.width - mascotBox.width - 48);
  const mascotTop = Math.max(0, OG.height - mascotBox.height - 8);

  const lockup = Buffer.from(
    `<svg width="${OG.width}" height="${OG.height}" xmlns="http://www.w3.org/2000/svg">` +
      `<text x="80" y="150" font-family="${FONT_STACK}" font-size="64" font-weight="700">` +
      `<tspan fill="${BRAND_RED}">سنڌلش</tspan>` +
      `<tspan fill="#ffffff" dx="28">Sindlish</tspan>` +
      `</text>` +
      `<text x="80" y="232" font-family="${FONT_STACK}" font-size="30" font-weight="500" fill="#9CA3AF">` +
      `The First Sindhi Programming Language</text>` +
      `<text x="80" y="576" font-family="${FONT_STACK}" font-size="22" font-weight="500" fill="#6B7280">` +
      `sindlish.org</text>` +
      `</svg>`
  );

  await sharp({ create: { ...OG, channels: 4, background: BLACK } })
    .composite([
      { input: mascot, top: mascotTop, left: mascotLeft },
      { input: lockup, top: 0, left: 0 },
    ])
    .png()
    .toFile(OG_OUT);

  console.log(`  images/og/default.png ${OG.width}x${OG.height}`);
}

async function main() {
  const mark = await loadMark();
  console.log('Favicon / PWA set (raster, transparent):');
  await writeFaviconSet(mark);
  console.log('Default social image:');
  await writeDefaultOg();
  console.log('done');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
