// Hash routes (#/, #/missions, ...): parsing, links, and every page opening from the menu.

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { hrefFor, NAV_ITEMS, NavGroupId, parseHash, ROUTE_IDS } from '../../src/ui/router.ts';

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
      const group = NAV_ITEMS.find((item) => item.kind === 'group' && item.pages.includes(id));
      if (group) {
        fireEvent.click(
          within(menu).getByRole('button', { name: copy.site.groups[group.id as NavGroupId] }),
        );
      }
      const link = within(menu).getByRole('link', { name: copy.site.pages[id] });
      expect(link.getAttribute('aria-current')).toBe('page');
      unmount();
    }
  });

  it('the menu has a top-level Sim link to the Sim page', () => {
    window.location.hash = hrefFor('home');
    render(<App />);
    const menu = screen.getByRole('navigation', { name: copy.site.navLabel });
    const sim = within(menu).getByRole('link', { name: copy.site.pages.sim });
    expect(sim.getAttribute('href')).toBe(hrefFor('sim'));
  });

  it('the header has a Sim button next to Quiz, outside the menu', () => {
    window.location.hash = hrefFor('home');
    render(<App />);
    const header = screen.getByRole('banner');
    const menu = screen.getByRole('navigation', { name: copy.site.navLabel });
    const sims = within(header).getAllByRole('link', { name: copy.site.sim });
    const button = sims.find((a) => !menu.contains(a));
    expect(button?.getAttribute('href')).toBe(hrefFor('sim'));
    expect(within(header).getByRole('link', { name: copy.quizCards.button })).toBeDefined();
  });

  it('the home page has a highlighted Sim button', () => {
    window.location.hash = hrefFor('home');
    render(<App />);
    const main = screen.getByRole('main');
    const sim = within(main).getByRole('link', { name: copy.landing.simButton });
    expect(sim.getAttribute('href')).toBe(hrefFor('sim'));
    expect(sim.className).toContain('landing-sim-link');
  });

  it('the Sim page launches the standalone 3D page and its gallery switches pictures', () => {
    window.location.hash = hrefFor('sim');
    render(<App />);
    const s = copy.simPage;
    expect(screen.getByRole('heading', { name: s.title })).toBeDefined();
    const launches = screen.getAllByRole('link', { name: s.launch });
    expect(launches.length).toBeGreaterThanOrEqual(1);
    for (const a of launches)
      expect(a.getAttribute('href')).toBe(`${import.meta.env.BASE_URL}sim/index.html`);
    for (const h of s.how) expect(screen.getByRole('heading', { name: h.title })).toBeDefined();
    for (const m of s.missions) expect(screen.getByRole('img', { name: m.alt })).toBeDefined();
    const last = s.gallery[s.gallery.length - 1];
    if (!last) throw new Error('gallery is empty');
    const thumb = screen.getByRole('button', { name: s.galleryShow(last.title) });
    fireEvent.click(thumb);
    expect(thumb.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('img', { name: last.alt })).toBeDefined();
  });
});
