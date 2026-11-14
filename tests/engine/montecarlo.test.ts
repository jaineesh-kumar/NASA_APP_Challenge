import { describe, expect, it } from 'vitest';
import { percentile, runCampaign, wilsonScoreInterval } from '../../src/engine/montecarlo.ts';
import { runMission } from '../../src/engine/sim.ts';
import { goldenDesign, goldenRules, params } from './fixtures.ts';

describe('campaign statistics (L5 AC5-AC8, AC10)', () => {
  it('AC5: wilson(0.5, 300) half-width is within 0.0005 of 0.0562 and clamps to [0, 1]', () => {
    const ci = wilsonScoreInterval(150, 300);
    expect(Math.abs((ci.high - ci.low) / 2 - 0.0562)).toBeLessThan(0.0005);
    expect(wilsonScoreInterval(0, 10).low).toBe(0);
    expect(wilsonScoreInterval(10, 10).high).toBeLessThanOrEqual(1);
    expect(wilsonScoreInterval(10, 10).high).toBeGreaterThan(0.99);
  });

  it('AC6: nearest-rank percentile uses index ceil(q*n) - 1', () => {
    const d = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(d, 0.05)).toBe(10);
    expect(percentile(d, 0.5)).toBe(50);
    expect(percentile(d, 0.95)).toBe(100);
    expect(percentile(d, 0.11)).toBe(20);
    expect(percentile([], 0.5)).toBe(0);
  });

  const runs = 40;
  const c = runCampaign(goldenDesign, goldenRules, runs, params, undefined, { sunEra: 'stormy' });
  const missions = Array.from({ length: runs }, (_, i) =>
    runMission(goldenDesign, goldenRules, i + 1, params, { sunEra: 'stormy' }),
  );

  it('AC7: causeCounts match the individual runs', () => {
    const failed = missions.filter((m) => !m.survived).length;
    const sumFail =
      c.causeCounts.oxygen +
      c.causeCounts.co2 +
      c.causeCounts.water +
      c.causeCounts.food +
      c.causeCounts.dose;
    expect(sumFail).toBe(failed);
    expect(c.causeCounts.science_missed).toBe(
      missions.filter((m) => m.survived && !m.scienceMet).length,
    );
    expect(c.survivalRate).toBe((runs - failed) / runs);
  });

  it('AC8: worstSeed is the earliest failure (ties: lowest seed), else lowest battery', () => {
    const failures = missions.filter((m) => !m.survived);
    if (failures.length > 0) {
      const earliest = Math.min(...failures.map((m) => m.failureHour ?? Infinity));
      expect(c.worstSeed).toBe(failures.find((m) => m.failureHour === earliest)?.seed);
    } else {
      const low = Math.min(...missions.map((m) => m.minBatteryPct));
      expect(c.worstSeed).toBe(missions.find((m) => m.minBatteryPct === low)?.seed);
    }
  });

  it('storm stats come from the real record', () => {
    expect(c.sunEra).toBe('stormy');
    const total = missions.reduce((s, m) => s + m.sun.storms.length, 0);
    expect(c.stormsPerRunMean).toBeCloseTo(total / runs, 12);
  });

  it('AC10: measures a 300-run campaign (reported, not promised)', () => {
    const t0 = performance.now();
    const r = runCampaign(goldenDesign, goldenRules, 300, params);
    const ms = performance.now() - t0;
    console.log(`[PERF] 300-run campaign: ${ms.toFixed(0)} ms`);
    expect(r.runs).toBe(300);
  });

  it('reports progress ending at 1', () => {
    const seen: number[] = [];
    runCampaign(goldenDesign, goldenRules, 30, params, (p) => seen.push(p));
    expect(seen.at(-1)).toBe(1);
  });
});
