// Hash routes (#/, #/missions, ...): parsing, links, and every page opening from the menu.

import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { hrefFor, parseHash, ROUTE_IDS } from '../../src/ui/router.ts';

describe('hash router', () => {
  it('parses every page hash and its sub-path', () => {
    expect(parseHash('')).toEqual({ id: 'home', sub: [] });
    expect(parseHash('#/')).toEqual({ id: 'home', sub: [] });
    expect(parseHash('#/how-to-play')).toEqual({ id: 'how-to-play', sub: [] });
    expect(parseHash('#/missions/M2/debrief')).toEqual({ id: 'missions', sub: ['M2', 'debrief'] });
    for (const id of ROUTE_IDS) expect(parseHash(hrefFor(id))?.id).toBe(id);
  });

  it('sends unknown pages home and ignores in-page anchors', () => {
    expect(parseHash('#/no-such-page')).toEqual({ id: 'home', sub: [] });
    expect(parseHash('#main-content')).toBeNull();
  });

  it('builds links that round-trip', () => {
    expect(hrefFor('home')).toBe('#/');
    expect(hrefFor('missions', 'M3', 'debrief')).toBe('#/missions/M3/debrief');
    expect(parseHash(hrefFor('missions', 'M3', 'debrief'))).toEqual({
      id: 'missions',
      sub: ['M3', 'debrief'],
    });
  });

  it('marks the open page in the menu, for every page', () => {
    for (const id of ROUTE_IDS) {
      window.location.hash = hrefFor(id);
      const { unmount } = render(<App />);
      const menu = screen.getByRole('navigation', { name: copy.site.navLabel });
      const link = within(menu).getByRole('link', { name: copy.site.pages[id] });
      expect(link.getAttribute('aria-current')).toBe('page');
      unmount();
    }
  });
});
