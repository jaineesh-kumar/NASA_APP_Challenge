import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { missionPresets } from '../../src/content/missions.ts';
import { runMission } from '../../src/engine/sim.ts';
import { CampaignResult, MissionResult } from '../../src/engine/types.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { ReviewScreen } from '../../src/ui/screens/Review.tsx';

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
  sunEra: 'stormy',
  stormsPerRunMean: 1.7,
  stormsMaxInRun: 4,
  warningsMissed: 6,
};

function findFailedRun(): MissionResult {
  const preset = missionPresets.find((p) => p.id === 'storm_bunker') ?? missionPresets[0]!;
  for (let seed = 1; seed < 200; seed++) {
    const r = runMission(preset.design, preset.rules, seed, undefined, {
      trace: true,
      sunEra: 'stormy',
    });
    if (!r.survived && r.sun.storms.length > 0) return r;
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
          { n: 1, massUsed: 80, riskPct: 40, sunEra: 'all' },
          { n: 2, massUsed: 98, riskPct: 10, sunEra: 'stormy' },
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
    expect(screen.getByText(copy.review.warningsMissed(6))).toBeDefined();
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
    expect(screen.getByText(copy.replay.sunWindow(worst.sun.startDate))).toBeDefined();
    expect(screen.getAllByRole('link', { name: copy.replay.donkiLink }).length).toBe(
      worst.sun.storms.length,
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
