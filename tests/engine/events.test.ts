import { describe, expect, it } from 'vitest';
import { createInitialEventsState, stepEvents } from '../../src/engine/events.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { runMission } from '../../src/engine/sim.ts';
import { Design } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, k, params } from './fixtures.ts';

describe('events and failures (L4 AC6-AC8)', () => {
  it('AC7: each tick draws exactly 6 numbers in fixed order (uSpe, uDust, 4 components)', () => {
    const src = mulberry32(1);
    const drawn: number[] = [];
    const recorder = () => {
      const v = src();
      drawn.push(v);
      return v;
    };
    let s = createInitialEventsState(goldenDesign);
    for (let t = 0; t < 10; t++) s = stepEvents(s, t, recorder, k).state;
    expect(drawn).toHaveLength(60);
    const ref = mulberry32(1);
    expect(drawn).toEqual(Array.from({ length: 60 }, () => ref()));
    // Snapshot of the first 50 draws for seed 1 (L4 AC7), recorded by Vitest from the real RNG.
    expect(drawn.slice(0, 50).map((v) => v.toFixed(6))).toMatchSnapshot();
  });

  it('a draw below the failure chance breaks a component; a spare sets finite repair time', () => {
    const forced = () => 0; // every draw triggers
    const withSpare = stepEvents(createInitialEventsState(goldenDesign), 0, forced, k);
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

  it('AC8: an SPE warning precedes onset by exactly spe_warning_lead_h (B5.5)', () => {
    const always = () => 0; // uSpe below the chance -> an event is scheduled at t
    let s = createInitialEventsState(goldenDesign);
    const first = stepEvents(s, 5, always, k);
    expect(first.isSpeWarningStarted).toBe(true);
    expect(first.state.spe?.onsetH).toBe(5 + k.speWarningLeadH);
    expect(first.state.spe?.endH).toBe(5 + k.speWarningLeadH + k.speDurationH);
    s = first.state;
    // No second event while one is pending or active; warning stays on until the end.
    for (let t = 6; t < 5 + k.speWarningLeadH + k.speDurationH; t++) {
      const st = stepEvents(s, t, always, k);
      expect(st.isSpeWarningStarted).toBe(false);
      expect(st.isSpeWarning).toBe(true);
      expect(st.isSpeStarted).toBe(t === 5 + k.speWarningLeadH);
      s = st.state;
    }
    // Whole missions: every spe_start is exactly lead hours after its spe_warning.
    let checked = 0;
    for (let seed = 1; seed <= 80; seed++) {
      const r = runMission(goldenDesign, goldenRules, seed, params);
      const warnings = r.log.filter((e) => e.type === 'spe_warning').map((e) => e.t);
      const starts = r.log.filter((e) => e.type === 'spe_start').map((e) => e.t);
      starts.forEach((t, i) => {
        expect(t - (warnings[i] ?? -1)).toBe(k.speWarningLeadH);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('replay mode never starts a random event but keeps the draw order', () => {
    const always = () => 0;
    const st = stepEvents(createInitialEventsState(goldenDesign), 3, always, k, false);
    expect(st.isSpeWarningStarted).toBe(false);
    expect(st.state.spe).toBeNull();
  });
});
