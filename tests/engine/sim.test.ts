import { describe, expect, it } from 'vitest';
import golden from '../golden/missions.json' with { type: 'json' };
import { runMission } from '../../src/engine/sim.ts';
import { Design, MissionResult, Rules } from '../../src/engine/types.ts';
import { craterDesign, goldenDesign, goldenRules, params } from './fixtures.ts';

export { goldenDesign, goldenRules };

const references: Record<string, { design: Design; rules: Rules }> = {
  ridge_balanced: { design: goldenDesign, rules: goldenRules },
  crater_closed_loop: { design: craterDesign, rules: goldenRules },
};

describe('runMission (L5 AC1, AC2)', () => {
  it('AC1: same inputs give a deep-equal result', () => {
    const a = runMission(goldenDesign, goldenRules, 123, params, { trace: true });
    const b = runMission(goldenDesign, goldenRules, 123, params, { trace: true });
    expect(a).toEqual(b);
  });

  it('AC2: golden results for seeds 1-3 on two named reference designs', () => {
    const expected = golden as Record<string, MissionResult[]>;
    for (const [name, ref] of Object.entries(references)) {
      const actual = [1, 2, 3].map((s) => runMission(ref.design, ref.rules, s, params));
      expect(actual, name).toEqual(expected[name]);
    }
  });

  it('produces a complete result and a 720-hour trace', () => {
    const r = runMission(goldenDesign, goldenRules, 5, params, { trace: true });
    const hours = r.failureHour === null ? 720 : r.failureHour + 1;
    expect(r.trace?.batteryPct).toHaveLength(hours);
    expect(r.minBatteryPct).toBeGreaterThanOrEqual(0);
    expect(r.minBatteryPct).toBeLessThanOrEqual(100);
    expect(r.scienceMet).toBe(r.scienceHours >= 120);
  });

  it('logs state changes, never per-tick spam', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const r = runMission({ ...goldenDesign, batteries: 1, panels: 2 }, goldenRules, seed, params);
      expect(r.log.length).toBeLessThan(400);
      const empties = r.log.filter((e) => e.type === 'battery_empty').map((e) => e.t);
      for (let i = 1; i < empties.length; i++)
        expect(empties[i]).not.toBe((empties[i - 1] ?? -9) + 1);
    }
  });

  it('the shelter rule lowers dose in runs with a solar particle event (same seed)', () => {
    const noShelter: Rules = { priority: goldenRules.priority, ifThen: [] };
    let compared = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const a = runMission(goldenDesign, goldenRules, seed, params);
      const b = runMission(goldenDesign, noShelter, seed, params);
      if (a.survived && b.survived && a.storms.length > 0) {
        expect(a.storms.every((st) => st.wasSheltered)).toBe(true);
        expect(a.peakDoseUsv).toBeLessThan(b.peakDoseUsv);
        compared++;
      }
    }
    expect(compared).toBeGreaterThan(0);
  });
});
