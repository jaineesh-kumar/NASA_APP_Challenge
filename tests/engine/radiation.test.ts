import { describe, expect, it } from 'vitest';
import { runMission } from '../../src/engine/sim.ts';
import { hourlyDoseUsv } from '../../src/engine/radiation.ts';
import { goldenDesign, goldenRules, k, noRules, params } from './fixtures.ts';

describe('radiation (L4 AC1-AC3)', () => {
  it('AC1: hourly dose is never negative, so dose never decreases', () => {
    for (const layers of [0, 1, 2, 3])
      for (const sh of [false, true])
        for (const storm of [false, true])
          expect(hourlyDoseUsv(layers, sh, storm ? k.speMultiplier : 1, k)).toBeGreaterThan(0);
  });

  it('AC2: more built shielding never raises dose', () => {
    for (const storm of [false, true]) {
      for (let l = 1; l <= 3; l++) {
        expect(hourlyDoseUsv(l, false, storm ? k.speMultiplier : 1, k)).toBeLessThanOrEqual(
          hourlyDoseUsv(l - 1, false, storm ? k.speMultiplier : 1, k),
        );
      }
    }
    // Fixed seed, whole mission: a design with more shielding ends with no more dose.
    const thin = runMission({ ...goldenDesign, shieldingLayers: 0 }, noRules, 2, params);
    const thick = runMission({ ...goldenDesign, shieldingLayers: 2 }, noRules, 2, params);
    if (thin.survived && thick.survived)
      expect(thick.peakDoseUsv).toBeLessThanOrEqual(thin.peakDoseUsv);
  });

  it('AC3: sheltering never raises dose', () => {
    for (let l = 0; l <= 3; l++) {
      expect(hourlyDoseUsv(l, true, k.speMultiplier, k)).toBeLessThanOrEqual(
        hourlyDoseUsv(l, false, k.speMultiplier, k),
      );
    }
  });

  it('dose in a run is monotonic over the trace', () => {
    const r = runMission(goldenDesign, goldenRules, 3, params, { trace: true });
    const d = r.trace?.doseUsv ?? [];
    for (let i = 1; i < d.length; i++) expect(d[i] ?? 0).toBeGreaterThanOrEqual(d[i - 1] ?? 0);
  });
});
