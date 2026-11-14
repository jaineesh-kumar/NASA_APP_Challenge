import { describe, expect, it } from 'vitest';
import { createInitialEventsState, stepEvents } from '../../src/engine/events.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { runMission } from '../../src/engine/sim.ts';
import { Design } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, k, params } from './fixtures.ts';

describe('events and failures (L4 AC6-AC8)', () => {
  it('AC7: each tick draws exactly 5 numbers in fixed order (uDust, then 4 components)', () => {
    const src = mulberry32(1);
    const drawn: number[] = [];
    const recorder = () => {
      const v = src();
      drawn.push(v);
      return v;
    };
    let s = createInitialEventsState(goldenDesign);
    for (let t = 0; t < 10; t++) s = stepEvents(s, recorder, k).state;
    expect(drawn).toHaveLength(50);
    const ref = mulberry32(1);
    expect(drawn).toEqual(Array.from({ length: 50 }, () => ref()));
    expect(drawn.slice(0, 5).map((v) => v.toFixed(6))).toMatchInlineSnapshot(`
      [
        "0.627074",
        "0.002736",
        "0.527447",
        "0.981051",
        "0.968378",
      ]
    `);
  });

  it('a draw below the failure chance breaks a component; a spare sets finite repair time', () => {
    const forced = () => 0; // every draw triggers
    const withSpare = stepEvents(createInitialEventsState(goldenDesign), forced, k);
    expect(withSpare.failed).toEqual([
      'co2_scrubber',
      'o2_generator',
      'water_processor',
      'power_array',
    ]);
    expect(withSpare.state.repairsLeftH.co2_scrubber).toBe(k.repairHours.co2_scrubber);
    expect(withSpare.state.repairsLeftH.water_processor).toBe(Infinity); // golden has 0 spares
    expect(Object.values(withSpare.state.isOk)).toEqual([false, false, false, false]);
    expect(withSpare.state.sparesLeft.co2_scrubber).toBe(goldenDesign.spares.co2_scrubber - 1);
    expect(withSpare.isDustStarted).toBe(true);
  });

  it('AC6: a spare never reduces repair success versus no spare (same seed)', () => {
    const noSpares: Design = {
      ...goldenDesign,
      spares: { co2_scrubber: 0, o2_generator: 0, water_processor: 0, power_array: 0 },
    };
    const allSpares: Design = {
      ...goldenDesign,
      spares: { co2_scrubber: 2, o2_generator: 2, water_processor: 2, power_array: 2 },
    };
    for (let seed = 1; seed <= 40; seed++) {
      const a = runMission(noSpares, goldenRules, seed, params);
      const b = runMission(allSpares, goldenRules, seed, params);
      const rep = (r: typeof a) => r.log.filter((e) => e.type === 'component_repaired').length;
      expect(rep(a)).toBe(0);
      // Same seed -> the first failure happens at the same hour in both runs.
      const fa = a.log.find((e) => e.type === 'component_failed');
      const fb = b.log.find((e) => e.type === 'component_failed');
      if (fa && fb) expect(fb.t).toBe(fa.t);
      expect(rep(b)).toBeGreaterThanOrEqual(rep(a));
    }
  });

  it('AC8: with comms on, a storm warning arrives exactly leadH hours before onset', () => {
    let checked = 0;
    for (let seed = 1; seed <= 60 && checked < 10; seed++) {
      const r = runMission(goldenDesign, goldenRules, seed, params, { sunEra: 'stormy' });
      for (const s of r.sun.storms) {
        if (s.leadH === 0 || s.onsetH - s.leadH < 1) continue;
        if (r.failureHour !== null && r.failureHour < s.onsetH) continue;
        const commsWasOn = !r.log.some((e) => e.type === 'load_off' && e.detail === 'comms');
        if (!commsWasOn) continue;
        expect(s.warningReceivedH).toBe(s.onsetH - s.leadH);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
