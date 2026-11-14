// Landing page (#/): story hook, Play button, real-data badge with the archived label.

import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { getDonkiArchive, loadParams } from '../../src/engine/params.ts';

describe('Landing page', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('opens on the story hook with crew size and days from params', () => {
    render(<App />);
    const p = loadParams();
    expect(screen.getByRole('heading', { name: copy.landing.title })).toBeDefined();
    expect(
      screen.getByText(
        copy.landing.story(p.getNumber('crew.size'), p.getNumber('mission.hours') / 24),
      ),
    ).toBeDefined();
  });

  it('has one Play button that leads to How to play', () => {
    render(<App />);
    const play = screen.getByRole('link', { name: copy.landing.play });
    expect(play.getAttribute('href')).toBe('#/how-to-play');
  });

  it('shows the real NASA data badge, labelled as saved copies and not live', () => {
    render(<App />);
    const badge = screen.getByRole('link', { name: new RegExp(copy.landing.badgeTitle) });
    expect(badge.getAttribute('href')).toBe('#/data');
    expect(badge.textContent).toContain(String(getDonkiArchive().events.length));
    expect(badge.textContent).toMatch(/Not live\./);
  });
});
