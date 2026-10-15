import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Home from './home';

const renderHome = () => renderToStaticMarkup(<Home />);

describe('homepage', () => {
  it('opens with a one-line pitch', () => {
    expect(renderHome()).toContain('A programming language in Romanised Sindhi.');
  });

  it('shows a real Sindlish program with its output', () => {
    const html = renderHome();

    expect(html).toContain('adad score = 72');
    expect(html).toContain('warna');
    expect(html).toContain('Output');
    expect(html).toContain('B');
  });

  it('makes Get started and Docs the first two actions', () => {
    const html = renderHome();

    const getStarted = html.indexOf('Get started');
    const docs = html.indexOf('>Docs<');
    const download = html.indexOf('download Sindlish');

    expect(getStarted).toBeGreaterThan(-1);
    expect(docs).toBeGreaterThan(getStarted);
    expect(download).toBeGreaterThan(docs);
  });

  it('says the hero line through the mascot', () => {
    expect(renderHome()).toContain('Salam, duniya!');
  });
});
