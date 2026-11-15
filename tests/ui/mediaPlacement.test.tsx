// Where media appears: landing, How to play, briefing, the Test-screen loader, the storm picker,
// mission cards, Teachers, Logbook and Space words. Never on the Build or Rules screens. The share
// image exists.

import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import indexHtml from '../../index.html?raw';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { media } from '../../src/content/media.ts';
import { getDonkiArchive } from '../../src/engine/params.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { DesignScreen } from '../../src/ui/screens/Design.tsx';
import { RehearseScreen } from '../../src/ui/screens/Rehearse.tsx';
import { RulesScreen } from '../../src/ui/screens/Rules.tsx';

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
});
afterEach(() => vi.restoreAllMocks());

const ids = (root: ParentNode) =>
  [...root.querySelectorAll('[data-media-id]')].map((n) => n.getAttribute('data-media-id'));

describe('media placement', () => {
  it('landing: hero clip, four journey clips, crew card and storm teaser', () => {
    window.location.hash = '#/';
    const { container } = render(<App />);
    expect(ids(container)).toEqual([
      'crew-walkout',
      'rocket-launch',
      'rocket-flight',
      'rocket-landing',
      'base-setup',
      'crew-walk',
      'storm-shelter',
    ]);
    const journey = screen.getByRole('list', { name: copy.landing.storyLabel });
    expect(journey.querySelectorAll('li')).toHaveLength(4);
    // Journey and crew clips wait for Play; only the hero and storm clips start on their own.
    for (const id of [
      'rocket-launch',
      'rocket-flight',
      'rocket-landing',
      'base-setup',
      'crew-walk',
    ]) {
      const card = container.querySelector(`[data-media-id="${id}"]`);
      expect(card?.querySelector('button')?.getAttribute('aria-label'), id).toBe(
        copy.media.playVideo,
      );
    }
    expect(screen.getByText(copy.landing.stormTeaser)).toBeDefined();
    // The Moon horizon strip was removed from the bottom of the page.
    expect(container.querySelector('[data-media-id="moon-horizon"]')).toBeNull();
  });

  it('briefing shows the base tour clip as a small 4:3 card', () => {
    window.location.hash = '#/free-build';
    const { container } = render(<App />);
    const card = container.querySelector('[data-media-id="base-tour"] .media-frame');
    expect((card as HTMLElement | null)?.style.aspectRatio).toBe('4 / 3');
  });

  it('How to play shows the cargo clip and the ladder picture', () => {
    window.location.hash = '#/how-to-play';
    const { container } = render(<App />);
    expect(ids(container)).toEqual(['cargo-weigh', 'ladder-still']);
  });

  it('the Build and Rules screens have no media', () => {
    const { container } = render(
      <AppStoreProvider>
        <DesignScreen />
        <RulesScreen />
      </AppStoreProvider>,
    );
    expect(container.querySelectorAll('.media-card')).toHaveLength(0);
  });

  it('the Test screen shows the missions-grid clip only while the tests run', () => {
    const idle = render(
      <AppStoreProvider initialState={{ ...initialAppState, currentScreen: 'rehearse' }}>
        <RehearseScreen />
      </AppStoreProvider>,
    );
    expect(ids(idle.container)).not.toContain('missions-grid');
    // The storm picker keeps its archived label next to the storm clip.
    expect(ids(idle.container)).toContain('storm-shelter');
    expect(
      screen.getAllByText(copy.storms.archivedLabel(getDonkiArchive().retrievedAt)).length,
    ).toBeGreaterThanOrEqual(1);
    idle.unmount();

    const running = render(
      <AppStoreProvider
        initialState={{ ...initialAppState, currentScreen: 'rehearse', isRunningCampaign: true }}
      >
        <RehearseScreen />
      </AppStoreProvider>,
    );
    expect(ids(running.container)).toContain('missions-grid');
  });

  it('every mission card shows its own clip', () => {
    window.location.hash = '#/missions';
    const { container } = render(<App />);
    expect(ids(container)).toEqual([
      'night-falls',
      'recycler-fix',
      'storm-shelter',
      'greenhouse-grow',
      'storm-warning',
    ]);
  });

  it('Teachers shows the classroom, Logbook the waving crew and badge pictures', () => {
    window.location.hash = '#/teachers';
    const teachers = render(<App />);
    expect(ids(teachers.container)).toContain('classroom');
    teachers.unmount();

    window.location.hash = '#/logbook';
    const logbook = render(<App />);
    expect(ids(logbook.container)).toContain('crew-wave');
    // Four badges have a picture; the other two keep their icon.
    expect(logbook.container.querySelectorAll('.badge-icon.has-picture img')).toHaveLength(4);
    logbook.unmount();
  });

  it('Space words shows six system icons', () => {
    window.location.hash = '#/words';
    const { container } = render(<App />);
    expect(container.querySelectorAll('img.word-icon')).toHaveLength(6);
  });

  it('index.html shares an existing image', () => {
    const m = indexHtml.match(/property="og:image" content="\.\/([^"]+)"/);
    expect(m).not.toBeNull();
    expect(decodeURI(m?.[1] ?? '')).toBe(media['share-banner'].file);
    expect(indexHtml).toMatch(/name="twitter:image"/);
  });
});
