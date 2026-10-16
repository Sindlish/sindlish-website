import { describe, expect, it } from 'vitest';

import { getFocusable } from './get-focusable';
import { nextFocusTarget } from './trap-focus';

const setup = () => {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'trap';
  container.innerHTML = `
    <a id="first" href="#first">first</a>
    <button id="mid">mid</button>
    <button id="skip" tabindex="-1">skip</button>
    <button id="hidden-btn" hidden>hidden</button>
    <span aria-hidden="true"><button id="a11y-hidden">a11y hidden</button></span>
    <button id="last">last</button>
  `;
  document.body.appendChild(container);
  return container;
};

describe('getFocusable', () => {
  it('collects focusable elements in DOM order, skipping hidden and inert ones', () => {
    const container = setup();
    const ids = getFocusable(container).map((el) => el.id || el.tagName);

    expect(ids).toEqual(['first', 'mid', 'last']);
  });

  it('returns an empty list for a container with nothing focusable', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    expect(getFocusable(container)).toEqual([]);
  });
});

describe('nextFocusTarget', () => {
  it('wraps Tab from the last element to the first', () => {
    const container = setup();
    const last = container.querySelector('#last');
    last.focus();

    const target = nextFocusTarget({ key: 'Tab', shiftKey: false }, container);
    expect(target.textContent).toBe('first');
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    const container = setup();
    const first = getFocusable(container)[0];
    first.focus();

    const target = nextFocusTarget({ key: 'Tab', shiftKey: true }, container);
    expect(target.id).toBe('last');
  });

  it('lets the browser handle Tab in the middle', () => {
    const container = setup();
    const mid = container.querySelector('#mid');
    mid.focus();

    expect(nextFocusTarget({ key: 'Tab', shiftKey: false }, container)).toBeNull();
    expect(nextFocusTarget({ key: 'Tab', shiftKey: true }, container)).toBeNull();
  });

  it('ignores keys other than Tab', () => {
    const container = setup();
    expect(nextFocusTarget({ key: 'Escape' }, container)).toBeNull();
  });

  it('returns null when nothing is focusable', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    expect(nextFocusTarget({ key: 'Tab' }, container)).toBeNull();
  });
});
