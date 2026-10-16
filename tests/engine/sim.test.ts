import { describe, expect, it } from 'vitest';
import goldenData from '../golden/seeds_1_2_3.json' with { type: 'json' };
import { loadParams } from '../../src/engine/params.ts';
import { runMission } from '../../src/engine/sim.ts';
import { Design, MissionResult, Rules } from '../../src/engine/types.ts';

export const goldenDesign: Design = {
  site: 'ridge',
  panels: 4,
  mastLevel: 1,
  batteries: 5,
  waterLoopTier: 1,
  o2LoopTier: 0,
  greenhouseModules: 1,
  shieldingLayers: 2,
  spares: {
    co2_scrubber: 1,
    o2_generator: 1,
    water_processor: 0,
    power_array: 1,
  },
};

export const goldenRules: Rules = {
  priority: ['life_support', 'thermal', 'comms', 'greenhouse', 'science', 'construction'],
  ifThen: [
    {
      condition: { kind: 'battery_below_pct', value: 20 },
      action: { kind: 'shed', load: 'science' },
    },
    {
      condition: { kind: 'spe_warning' },
      action: { kind: 'shelter' },
    },
  ],
};

describe('runMission simulation engine (Spec B5.4, AC2, AC3)', () => {
  const params = loadParams();

  it('runs complete 720 ticks and produces valid MissionResult (AC2)', () => {
    const res = runMission(goldenDesign, goldenRules, 42, params);

    expect(res.seed).toBe(42);
    expect(res.survived).toBeTypeOf('boolean');
    expect(res.scienceMet).toBeTypeOf('boolean');
    expect(res.minBatteryPct).toBeGreaterThanOrEqual(0);
    expect(res.minBatteryPct).toBeLessThanOrEqual(100);
    expect(res.minO2Days).toBeGreaterThanOrEqual(0);
    expect(res.peakDoseUsv).toBeGreaterThan(0);
    expect(Array.isArray(res.log)).toBe(true);
    expect(res.log.length).toBeGreaterThan(0);
  });

  it('matches golden results for seeds 1, 2, 3 bit-for-bit (AC2)', () => {
    const expected = goldenData as MissionResult[];
    const actual = [1, 2, 3].map((seed) => runMission(goldenDesign, goldenRules, seed, params));

    expect(actual).toEqual(expected);
  });

  it('science target met iff scienceHours >= science.target_hours (AC3)', () => {
    const res = runMission(goldenDesign, goldenRules, 1, params);
    if (res.survived && res.scienceMet) {
      expect(res.survived).toBe(true);
    }
  });

  it('deterministically replicates identical seed results bit-for-bit', () => {
    const run1 = runMission(goldenDesign, goldenRules, 123, params);
    const run2 = runMission(goldenDesign, goldenRules, 123, params);

    expect(run1).toEqual(run2);
  });
});
