import { describe, expect, it } from 'vitest';
import {
  allocatePower,
  computeDemands,
  computeGeneration,
  updateBattery,
} from '../../src/engine/power.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { LoadId } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, k } from './fixtures.ts';

const none = new Set<LoadId>();
const baseInput = {
  inDarkWindow: false,
  ghLow: false,
  pauseScience: false,
  isSheltering: false,
  allShieldsBuilt: false,
  forcedOff: none,
};

describe('power (L2 AC4-AC8)', () => {
  it('generation follows B5.4 step 3', () => {
    expect(computeGeneration(4, false, false, false, k)).toBe(4 * k.panelKw);
    expect(computeGeneration(4, true, false, false, k)).toBe(0);
    expect(computeGeneration(4, false, true, true, k)).toBeCloseTo(
      4 * k.panelKw * k.dustFactor * k.arrayFailureFactor,
      10,
    );
  });

  it('AC6: with a shortage, lower-priority loads turn off first', () => {
    const d = computeDemands(goldenDesign, baseInput, k);
    const need = d.life_support + d.thermal + d.comms;
    const r = allocatePower(need, goldenRules.priority, d, none);
    expect(r.powered.life_support && r.powered.thermal && r.powered.comms).toBe(true);
    expect(r.powered.greenhouse || r.powered.science || r.powered.construction).toBe(false);
    expect(r.starved.greenhouse).toBe(true);
  });

  it('AC7: all-or-nothing, a smaller load further down can still run', () => {
    const d = { life_support: 5, thermal: 4, comms: 1, greenhouse: 9, science: 3, construction: 3 };
    const r = allocatePower(11, goldenRules.priority, d, none);
    expect(r.powered.greenhouse).toBe(false); // 9 > 1 left
    expect(r.suppliedKw).toBe(10);
    expect(r.powered.science).toBe(false);
  });

  it('forced-off loads never run and are not counted as starved', () => {
    const forced = new Set<LoadId>(['comms']);
    const d = computeDemands(goldenDesign, { ...baseInput, forcedOff: forced }, k);
    const r = allocatePower(1000, goldenRules.priority, d, forced);
    expect(r.powered.comms).toBe(false);
    expect(r.starved.comms).toBe(false);
  });

  it('AC4 + AC5: battery stays in [0, capacity] and supply never exceeds gen + battery', () => {
    const rng = mulberry32(3);
    const cap = goldenDesign.batteries * k.batteryKwhPerUnit;
    let b = cap;
    for (let t = 0; t < k.missionHours; t++) {
      const dark = rng() < 0.4;
      const gen = computeGeneration(goldenDesign.panels, dark, rng() < 0.3, rng() < 0.2, k);
      const d = computeDemands(goldenDesign, { ...baseInput, inDarkWindow: dark }, k);
      const r = allocatePower(gen + b, goldenRules.priority, d, none);
      expect(r.suppliedKw).toBeLessThanOrEqual(gen + b + 1e-9);
      b = updateBattery(b, cap, gen, r.suppliedKw, k);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(cap);
    }
  });

  it('AC8: allocation is deterministic', () => {
    const d = computeDemands(goldenDesign, baseInput, k);
    expect(allocatePower(17, goldenRules.priority, d, none)).toEqual(
      allocatePower(17, goldenRules.priority, d, none),
    );
  });

  it('dark windows raise thermal demand; shelter removes science and construction', () => {
    const lit = computeDemands(goldenDesign, baseInput, k);
    const dark = computeDemands(goldenDesign, { ...baseInput, inDarkWindow: true }, k);
    expect(dark.thermal).toBeCloseTo(lit.thermal * k.thermalDarkMultiplier, 10);
    const sh = computeDemands(goldenDesign, { ...baseInput, isSheltering: true }, k);
    expect(sh.science).toBe(0);
    expect(sh.construction).toBe(0);
  });
});
