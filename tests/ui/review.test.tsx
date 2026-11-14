import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { missionPresets } from '../../src/content/missions.ts';
import { getDonkiArchive } from '../../src/engine/params.ts';
import { runMission } from '../../src/engine/sim.ts';
import { CampaignResult, MissionResult, StormMode } from '../../src/engine/types.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { stormDate } from '../../src/ui/components/StormPicker.tsx';
import { ReviewScreen } from '../../src/ui/screens/Review.tsx';

const storm = getDonkiArchive().events[0]!;
const replay: StormMode = { kind: 'replay', eventId: storm.id };

// Fixture CampaignResult (L7 AC7); the worst run is a real engine run so the replay has a trace.
const fixture: CampaignResult = {
  runs: 300,
  survivalRate: 0.9,
  successRate: 0.85,
  survivalCi: { low: 0.861, high: 0.929 },
  successCi: { low: 0.805, high: 0.887 },
  minBatteryPctP5: 22.5,
  minO2DaysP5: 12,
  doseUsvP95: 32000,
  causeCounts: { oxygen: 4, co2: 12, water: 3, food: 0, dose: 11, science_missed: 15 },
  massUsed: 98,
  worstSeed: 3,
  rating: 'needs_work',
  stormMode: replay,
  stormsPerRunMean: 1,
  stormsMaxInRun: 1,
};

function findFailedRun(): MissionResult {
  const preset = missionPresets.find((p) => p.id === 'storm_bunker') ?? missionPresets[0]!;
  const weak = { ...preset.design, batteries: 2 };
  for (let seed = 1; seed < 200; seed++) {
    const r = runMission(weak, preset.rules, seed, undefined, { trace: true, stormMode: replay });
    if (!r.survived) return r;
  }
  throw new Error('no failed run found for fixture');
}
const worst = findFailedRun();

const renderReview = () =>
  render(
    <AppStoreProvider
      initialState={{
        ...initialAppState,
        campaignResult: fixture,
        worstMissionResult: worst,
        history: [
          { n: 1, massUsed: 80, riskPct: 40, stormMode: { kind: 'random' } },
          { n: 2, massUsed: 98, riskPct: 10, stormMode: replay },
        ],
      }}
    >
      <ReviewScreen />
    </AppStoreProvider>,
  );

describe('ReviewScreen (L7 AC2-AC7)', () => {
  it('AC2: survival and success with ranges, margins, rating, cause bars', () => {
    renderReview();
    expect(screen.getByText(new RegExp(copy.review.needsWorkTitle))).toBeDefined();
    expect(screen.getByText('90.0%')).toBeDefined();
    expect(screen.getByText(/86\.1% – 92\.9%/)).toBeDefined();
    expect(screen.getByText(copy.review.batteryP5Label)).toBeDefined();
    // L10 AC7: the result names the real storm.
    expect(screen.getByText(copy.stormResult.vsStorm(stormDate(storm), 90))).toBeDefined();
    expect(
      screen.getAllByText(copy.storms.archivedLabel(getDonkiArchive().retrievedAt), {
        exact: false,
      }).length,
    ).toBeGreaterThan(0);
  });

  it('AC3: the mass-vs-risk chart lists every tested design', () => {
    renderReview();
    const chart = screen.getByRole('img', { name: copy.review.massRiskChartTitle });
    expect(chart.querySelectorAll('circle').length).toBeGreaterThanOrEqual(4); // 2 points + 2 hit targets
  });

  it('AC4: the replay has play/pause and a scrubber, and shows the real storms', () => {
    renderReview();
    const slider = screen.getByRole('slider', {
      name: copy.replay.scrubberLabel,
    }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '10' } });
    expect(screen.getByText(copy.replay.hourNow(10, 720))).toBeDefined();
    const play = screen.getByRole('button', { name: new RegExp(copy.replay.play) });
    fireEvent.click(play);
    expect(screen.getByRole('button', { name: new RegExp(copy.replay.pause) })).toBeDefined();
    expect(
      screen.getByText(copy.replay.replayStorm(stormDate(storm), storm.flareClass), {
        exact: false,
      }),
    ).toBeDefined();
    expect(screen.getByRole('link', { name: copy.replay.donkiLink }).getAttribute('href')).toBe(
      storm.link,
    );
  });

  it('AC5: the cause chain comes from the log and a hint is shown', () => {
    renderReview();
    const section = screen.getByRole('region', { name: copy.causeChain.title });
    expect(within(section).getByText(copy.causeChain.hintTitle)).toBeDefined();
  });

  it('AC6: "Why this number?" opens the param entry', () => {
    renderReview();
    const why = screen.getAllByRole('button', { name: /Why this number/i });
    expect(why.length).toBeGreaterThan(3);
    fireEvent.click(why[0]!);
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('shows the empty state without results', () => {
    render(
      <AppStoreProvider>
        <ReviewScreen />
      </AppStoreProvider>,
    );
    expect(screen.getByText(copy.review.noResultsTitle)).toBeDefined();
  });
});
