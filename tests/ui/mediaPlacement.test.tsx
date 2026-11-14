// Where media appears: landing, briefing, the Test-screen loader, the storm picker and storm
// missions. Never on the Build or Rules screens. The share image exists.

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
  it('landing: hero clip, journey clip, storm teaser and a decorative horizon', () => {
    window.location.hash = '#/';
    const { container } = render(<App />);
    expect(ids(container)).toEqual([
      'crew-walkout',
      'rocket-flight',
      'storm-shelter',
      'moon-horizon',
    ]);
    expect(screen.getByText(copy.landing.stormTeaser)).toBeDefined();
    const horizon = container.querySelector('[data-media-id="moon-horizon"]');
    expect(horizon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('briefing shows the base picture as a small 4:3 card', () => {
    window.location.hash = '#/free-build';
    const { container } = render(<App />);
    const card = container.querySelector('[data-media-id="base-scene"] .media-frame');
    expect((card as HTMLElement | null)?.style.aspectRatio).toBe('4 / 3');
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

  it('storm missions (M3, M5) show the storm clip on their card', () => {
    window.location.hash = '#/missions';
    const { container } = render(<App />);
    expect(ids(container).filter((i) => i === 'storm-shelter')).toHaveLength(2);
  });

  it('index.html shares an existing image', () => {
    const m = indexHtml.match(/property="og:image" content="\.\/([^"]+)"/);
    expect(m).not.toBeNull();
    expect(decodeURI(m?.[1] ?? '')).toBe(media['base-scene'].file);
    expect(indexHtml).toMatch(/name="twitter:image"/);
  });
});
