// How to Play (#/how-to-play): three picture cards and the guided first mission with coach tips.

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { media } from '../../src/content/media.ts';
import { guidedMissions } from '../../src/content/missions.ts';
import { CampaignResult, MissionResult } from '../../src/engine/types.ts';
import { appReducer, AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { MissionBanner } from '../../src/ui/components/MissionBanner.tsx';
import { MISSION_GOAL_HOME } from '../../src/ui/missionFlow.ts';

const m1 = guidedMissions[0]!;

describe('How to Play', () => {
  beforeEach(() => {
    window.location.hash = '#/how-to-play';
  });

  it('shows three picture cards, each picture with a text description', () => {
    render(<App />);
    const cards = screen.getByRole('list', { name: copy.howTo.cardsLabel });
    expect(cards.querySelectorAll('li')).toHaveLength(3);
    // Step 1 is the cargo clip, described by its catalog alt text.
    const clip = cards.querySelector('li [data-media-id="cargo-weigh"] video');
    expect(clip?.getAttribute('aria-label')).toBe(media['cargo-weigh'].alt);
    // Step 2 is the ladder picture, described by its catalog alt text.
    expect(screen.getByRole('img', { name: media['ladder-still'].alt })).toBeDefined();
    for (const [i, card] of copy.howTo.cards.entries()) {
      if (i > 1) expect(screen.getByRole('img', { name: card.picture })).toBeDefined();
      expect(screen.getByRole('heading', { name: card.title })).toBeDefined();
    }
  });

  it('starts the guided first mission on the Build step with a coach tip', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.howTo.startGuided) }));
    expect(await screen.findByRole('heading', { name: m1.title })).toBeDefined();
    expect(window.location.hash).toBe('#/free-build');
    expect(screen.getByText(copy.flow.stepOf(2, 5))).toBeDefined();
    expect(screen.getByText(m1.coach.design ?? '')).toBeDefined();
    expect(screen.getByText(copy.mission.goal(MISSION_GOAL_HOME))).toBeDefined();
  });
});

describe('active mission state', () => {
  const result = (home: number) =>
    ({ massUsed: 90, survivalRate: home / 100, stormMode: { kind: 'random' } }) as CampaignResult;

  it('LOAD_MISSION starts it, a test records crews home, END_MISSION leaves it', () => {
    let s = appReducer(initialAppState, { type: 'LOAD_MISSION', mission: m1 });
    expect(s.mission).toEqual({ id: 'M1', hasTested: false, lastHome: null });
    s = appReducer(s, {
      type: 'SET_CAMPAIGN_RESULT',
      result: result(96),
      worstRun: {} as MissionResult,
    });
    expect(s.mission).toEqual({ id: 'M1', hasTested: true, lastHome: 96 });
    s = appReducer(s, { type: 'END_MISSION' });
    expect(s.mission).toBeNull();
  });

  it('a test without a mission leaves mission empty', () => {
    const s = appReducer(initialAppState, {
      type: 'SET_CAMPAIGN_RESULT',
      result: result(50),
      worstRun: {} as MissionResult,
    });
    expect(s.mission).toBeNull();
  });

  it('the banner celebrates a reached goal and links to the debrief', () => {
    render(
      <AppStoreProvider
        initialState={{ ...initialAppState, mission: { id: 'M1', hasTested: true, lastHome: 96 } }}
      >
        <MissionBanner step="review" />
      </AppStoreProvider>,
    );
    expect(screen.getByText(new RegExp(copy.mission.goalMet(96).slice(0, 12)))).toBeDefined();
    const link = screen.getByRole('link', { name: new RegExp(copy.mission.debrief) });
    expect(link.getAttribute('href')).toBe('#/missions/M1/debrief');
  });

  it('the banner is kind when the goal is not reached yet', () => {
    render(
      <AppStoreProvider
        initialState={{ ...initialAppState, mission: { id: 'M1', hasTested: true, lastHome: 40 } }}
      >
        <MissionBanner step="review" />
      </AppStoreProvider>,
    );
    expect(screen.getByText(copy.mission.goalNotYet(40, MISSION_GOAL_HOME))).toBeDefined();
    expect(
      screen.getByRole('link', { name: new RegExp(copy.mission.debriefAnyway) }),
    ).toBeDefined();
  });
});
