'use client';

import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import { cn } from 'utils/cn';

let mermaidAPI;

/*
 * Mermaid needs concrete colours, but every colour in the site lives once in
 * `src/styles/tokens.css` as a `light-dark()` pair behind a CSS custom
 * property. `getComputedStyle(...).getPropertyValue('--x')` returns the literal
 * `light-dark(a, b)` string (custom properties are not resolved), so we resolve
 * each token by assigning it to a throwaway element's `color` and reading back
 * the computed value. The probe inherits the document's `color-scheme`, so the
 * browser picks the light or dark half for us — no hard-coded palette, and the
 * diagram follows the theme automatically (the MutationObserver below re-renders
 * on scheme change).
 */
let probeEl;
const resolveToken = (name) => {
  if (!probeEl) {
    probeEl = document.createElement('div');
    probeEl.setAttribute('aria-hidden', 'true');
    probeEl.style.cssText =
      'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probeEl);
  }
  probeEl.style.color = `var(${name})`;
  return getComputedStyle(probeEl).color;
};

const toHex = (color) => {
  const match = color && color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!match) return color;
  const [r, g, b] = [match[1], match[2], match[3]].map((n) =>
    Number(n).toString(16).padStart(2, '0')
  );
  return `#${r}${g}${b}`;
};

const getTokenColors = () => {
  const read = (name) => toHex(resolveToken(name));
  return {
    page: read('--color-surface-page'),
    raised: read('--color-surface-raised'),
    overlay: read('--color-surface-overlay'),
    textPrimary: read('--color-text-primary'),
    textSecondary: read('--color-text-secondary'),
    textMuted: read('--color-text-muted'),
    link: read('--color-link'),
    linkHover: read('--color-link-hover'),
    ok: read('--color-ok'),
    err: read('--color-err'),
    border: read('--color-border'),
    borderStrong: read('--color-border-strong'),
    brand: read('--color-brand'),
  };
};

// Categorical palette for git graphs. The token layer is semantic, not a hue
// wheel, so this reuses the few distinct token hues available rather than
// inventing off-palette colours.
const gitPalette = (c) => [
  c.brand,
  c.link,
  c.ok,
  c.err,
  c.linkHover,
  c.textMuted,
  c.borderStrong,
  c.textSecondary,
];

const getTokenTheme = () => {
  const c = getTokenColors();
  const git = gitPalette(c);
  return {
    theme: 'base',
    themeVariables: {
      primaryColor: c.raised,
      primaryBorderColor: c.borderStrong,
      primaryTextColor: c.textPrimary,
      secondaryColor: c.overlay,
      secondaryBorderColor: c.borderStrong,
      secondaryTextColor: c.textPrimary,
      tertiaryColor: c.raised,
      tertiaryBorderColor: c.border,
      tertiaryTextColor: c.textSecondary,
      noteBkgColor: c.overlay,
      noteBorderColor: c.borderStrong,
      noteTextColor: c.textSecondary,
      textColor: c.textPrimary,
      lineColor: c.borderStrong,
      background: c.page,
      mainBkg: c.page,
      fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
      fontSize: '14px',
      git0: git[0],
      git1: git[1],
      git2: git[2],
      git3: git[3],
      git4: git[4],
      git5: git[5],
      git6: git[6],
      git7: git[7],
      gitBranchLabel0: c.page,
      gitBranchLabel1: c.page,
      gitBranchLabel2: c.page,
      gitBranchLabel3: c.page,
      gitBranchLabel4: c.page,
      gitBranchLabel5: c.page,
      gitBranchLabel6: c.textPrimary,
      gitBranchLabel7: c.textPrimary,
      nodeBorder: c.borderStrong,
      clusterBkg: c.raised,
      clusterBorder: c.border,
      actorBkg: c.raised,
      actorBorder: c.borderStrong,
      actorTextColor: c.textPrimary,
      actorLineColor: c.border,
      signalColor: c.textSecondary,
      signalTextColor: c.textSecondary,
      labelBoxBkgColor: c.raised,
      labelBoxBorderColor: c.border,
      labelTextColor: c.textPrimary,
      loopTextColor: c.textSecondary,
      activationBorderColor: c.borderStrong,
      activationBkgColor: c.raised,
      sequenceNumberColor: c.textPrimary,
      labelColor: c.textPrimary,
      attributeBackgroundColorOdd: c.page,
      attributeBackgroundColorEven: c.raised,
    },
  };
};

const Mermaid = ({ chart, className }) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    const renderChart = async () => {
      try {
        await document.fonts.ready;

        if (!mermaidAPI) {
          const mermaid = (await import('mermaid')).default;
          mermaid.initialize({
            startOnLoad: false,
            ...getTokenTheme(),
            flowchart: { padding: 25 },
          });
          mermaidAPI = mermaid;
        }

        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg: renderedSvg } = await mermaidAPI.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err.message);
      }
    };

    renderChart();
  }, [chart, themeKey]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          mermaidAPI = null;
          setThemeKey((prev) => prev + 1);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (error) {
    return (
      <div
        className={cn(
          'my-8 rounded-lg border p-6',
          'border-border bg-surface-raised text-text-secondary'
        )}
      >
        <p className="text-sm font-semibold text-err">Mermaid Diagram Error</p>
        <pre className="mt-2 overflow-auto text-xs text-text-secondary">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return null;
  }

  return (
    <div
      className={cn('mermaid-container not-prose', className)}
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

Mermaid.propTypes = {
  chart: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Mermaid.defaultProps = {
  className: '',
};

export default Mermaid;
