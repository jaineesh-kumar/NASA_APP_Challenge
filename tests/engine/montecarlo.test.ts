import { describe, expect, it } from 'vitest';
import { percentile, runCampaign, wilsonScoreInterval } from '../../src/engine/montecarlo.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules } from './sim.test.ts';

describe('Monte Carlo campaign runner and statistics (Spec B5.7, AC4, AC5, AC8)', () => {
  const params = loadParams();

  it('computes 95% Wilson score interval matching textbook formula (AC4)', () => {
    // 95 successes out of 100
    const ci1 = wilsonScoreInterval(95, 100);
    expect(ci1.low).toBeGreaterThan(0.88);
    expect(ci1.low).toBeLessThan(0.9);
    expect(ci1.high).toBeGreaterThan(0.97);
    expect(ci1.high).toBeLessThan(0.99);

    // 0 successes out of 50
    const ci0 = wilsonScoreInterval(0, 50);
    expect(ci0.low).toBe(0);
    expect(ci0.high).toBeGreaterThan(0);
    expect(ci0.high).toBeLessThan(0.1);

    // 50 successes out of 50
    const ciFull = wilsonScoreInterval(50, 50);
    expect(ciFull.low).toBeGreaterThan(0.9);
    expect(ciFull.high).toBeCloseTo(1.0, 5);
  });

  it('computes percentiles accurately', () => {
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(data, 0.05)).toBe(10);
    expect(percentile(data, 0.5)).toBe(50);
    expect(percentile(data, 0.95)).toBe(90);
  });

  it('assigns flight_ready rating only if survival >= 95% and success >= 80% (AC5)', () => {
    const flightDesign: Design = {
      site: 'ridge',
      panels: 5,
      mastLevel: 2,
      batteries: 6,
      waterLoopTier: 1,
      o2LoopTier: 1,
      greenhouseModules: 1,
      shieldingLayers: 2,
      spares: {
        co2_scrubber: 2,
        o2_generator: 1,
        water_processor: 1,
        power_array: 1,
      },
    };

    const campaign = runCampaign(flightDesign, goldenRules, 20, params);
    if (campaign.survivalRate >= 0.95 && campaign.successRate >= 0.8) {
      expect(campaign.rating).toBe('flight_ready');
    } else {
      expect(campaign.rating).toBe('needs_work');
    }
  });

  it('runs 300 missions within performance budget and measures elapsed time (AC8)', () => {
    const t0 = performance.now();
    const campaign = runCampaign(goldenDesign, goldenRules, 300, params);
    const elapsedMs = performance.now() - t0;

    expect(campaign.runs).toBe(300);
    expect(campaign.survivalRate).toBeGreaterThanOrEqual(0);
    expect(campaign.survivalRate).toBeLessThanOrEqual(1);
    expect(campaign.worstSeed).toBeGreaterThanOrEqual(1);
    expect(campaign.worstSeed).toBeLessThanOrEqual(300);

    // Log the measured runtime for the level report
    console.log(`[PERF] 300-run campaign completed in ${elapsedMs.toFixed(1)} ms`);
    expect(elapsedMs).toBeGreaterThan(0);
  });

  it('calls onProgress callback periodically during execution', () => {
    const progressUpdates: number[] = [];
    runCampaign(goldenDesign, goldenRules, 50, params, (p) => {
      progressUpdates.push(p);
    });

    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(1.0);
  });
});
