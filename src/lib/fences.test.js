import { describe, it, expect } from 'vitest';

import { FENCE_KIND, parseFence } from './fences';

describe('parseFence', () => {
  describe('the four authoring fences', () => {
    it('treats `sd` as a runnable example', () => {
      const fence = parseFence('sd');
      expect(fence.kind).toBe(FENCE_KIND.RUNNABLE);
      expect(fence.runnable).toBe(true);
      expect(fence.illustrative).toBe(false);
      expect(fence.isOutput).toBe(false);
    });

    it('treats `sd illustrative` as illustrative and never runnable', () => {
      const fence = parseFence('sd', 'illustrative');
      expect(fence.kind).toBe(FENCE_KIND.ILLUSTRATIVE);
      expect(fence.illustrative).toBe(true);
      expect(fence.runnable).toBe(false);
    });

    it('parses `txt filename="Output"` as a labelled expected-output region', () => {
      const fence = parseFence('txt', 'filename="Output"');
      expect(fence.kind).toBe(FENCE_KIND.OUTPUT);
      expect(fence.isOutput).toBe(true);
      expect(fence.label).toBe('Expected output');
      expect(fence.accessibleName).toBe('Expected output');
    });

    it('keeps a real filename on a txt block in the label', () => {
      const fence = parseFence('txt', 'filename="result.txt"');
      expect(fence.kind).toBe(FENCE_KIND.OUTPUT);
      expect(fence.label).toBe('Expected output: result.txt');
      expect(fence.filename).toBe('result.txt');
    });

    it('treats `bash` as a shell block', () => {
      const fence = parseFence('bash');
      expect(fence.kind).toBe(FENCE_KIND.SHELL);
      expect(fence.runnable).toBe(false);
      expect(fence.isOutput).toBe(false);
    });
  });

  describe('file names appear only when a file exists', () => {
    it('exposes no accessible name for an sd block without a filename', () => {
      expect(parseFence('sd').accessibleName).toBeNull();
      expect(parseFence('sd').filename).toBeNull();
    });

    it('exposes the authored filename when one exists', () => {
      const fence = parseFence('bash', 'filename="install.sh"');
      expect(fence.filename).toBe('install.sh');
      expect(fence.accessibleName).toBe('install.sh');
    });

    it('supports unquoted and single-quoted filenames', () => {
      expect(parseFence('js', 'filename=app.js').filename).toBe('app.js');
      expect(parseFence('js', "filename='app.js'").filename).toBe('app.js');
    });
  });

  describe('defensive fallback', () => {
    it('renders any other language as a plain block with no Run', () => {
      const fence = parseFence('python');
      expect(fence.kind).toBe(FENCE_KIND.PLAIN);
      expect(fence.runnable).toBe(false);
      expect(fence.isOutput).toBe(false);
    });

    it('does not treat a filename attribute as an illustrative token', () => {
      const fence = parseFence('sd', 'filename="game.sd"');
      expect(fence.illustrative).toBe(false);
      expect(fence.runnable).toBe(true);
      expect(fence.filename).toBe('game.sd');
    });

    it('handles a missing language and meta', () => {
      const fence = parseFence(undefined, undefined);
      expect(fence.kind).toBe(FENCE_KIND.PLAIN);
      expect(fence.language).toBe('text');
    });

    it('is case-insensitive on the language', () => {
      expect(parseFence('SD', 'illustrative').kind).toBe(FENCE_KIND.ILLUSTRATIVE);
      expect(parseFence('TXT', 'filename="Output"').kind).toBe(FENCE_KIND.OUTPUT);
    });

    it('falls the retired shell aliases back to plain blocks', () => {
      for (const lang of ['sh', 'shell', 'console']) {
        expect(parseFence(lang).kind, lang).toBe(FENCE_KIND.PLAIN);
      }
    });
  });
});
