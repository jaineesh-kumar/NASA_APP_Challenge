import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { NAV_ITEMS, ROUTE_IDS } from '../../src/ui/router.ts';

const menu = () => screen.getByRole('navigation', { name: copy.site.navLabel });

describe('main menu with dropdown groups', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('every page is in the menu exactly once', () => {
    const listed = NAV_ITEMS.flatMap((item) => (item.kind === 'link' ? [item.id] : item.pages));
    expect([...listed].sort()).toEqual([...ROUTE_IDS].sort());
  });

  it('shows Home and Logbook as links and Play, Learn, About as closed dropdowns', () => {
    render(<App />);
    const nav = menu();
    expect(within(nav).getByRole('link', { name: copy.site.pages.home })).toBeDefined();
    expect(within(nav).getByRole('link', { name: copy.site.pages.logbook })).toBeDefined();
    for (const g of [copy.site.groups.play, copy.site.groups.learn, copy.site.groups.about]) {
      expect(within(nav).getByRole('button', { name: g }).getAttribute('aria-expanded')).toBe(
        'false',
      );
    }
    expect(within(nav).queryByRole('link', { name: copy.site.pages.missions })).toBeNull();
  });

  it('opens one dropdown at a time and closes it with Escape, focus back on its button', () => {
    render(<App />);
    const nav = menu();
    const play = within(nav).getByRole('button', { name: copy.site.groups.play });
    const learn = within(nav).getByRole('button', { name: copy.site.groups.learn });

    fireEvent.click(play);
    expect(play.getAttribute('aria-expanded')).toBe('true');
    expect(within(nav).getByRole('link', { name: copy.site.pages.missions })).toBeDefined();
    expect(within(nav).getByRole('link', { name: copy.site.sim })).toBeDefined();

    fireEvent.click(learn);
    expect(play.getAttribute('aria-expanded')).toBe('false');
    expect(learn.getAttribute('aria-expanded')).toBe('true');

    const words = within(nav).getByRole('link', { name: copy.site.pages.words });
    fireEvent.keyDown(words, { key: 'Escape' });
    expect(learn.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(learn);
  });

  it('closes an open dropdown on a click outside the menu', () => {
    render(<App />);
    const about = within(menu()).getByRole('button', { name: copy.site.groups.about });
    fireEvent.click(about);
    expect(about.getAttribute('aria-expanded')).toBe('true');
    fireEvent.pointerDown(document.body);
    expect(about.getAttribute('aria-expanded')).toBe('false');
  });

  it('marks the group that holds the open page', () => {
    window.location.hash = '#/training';
    render(<App />);
    const learn = within(menu()).getByRole('button', { name: copy.site.groups.learn });
    expect(learn.className).toContain('has-current');
  });
});
