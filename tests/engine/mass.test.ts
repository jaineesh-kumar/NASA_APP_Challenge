import { describe, expect, it } from 'vitest';
import { isWithinBudget, massUsed } from '../../src/engine/mass.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design } from '../../src/engine/types.ts';

describe('massUsed and isWithinBudget (Spec B5.8, AC5, AC6)', () => {
  const params = loadParams();

  it('matches hand-computed mass for a reference design (AC5)', () => {
    const referenceDesign: Design = {
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

    // Hand calculation:
    // 4 panels * 5 = 20
    // 1 mast * 6 = 6
    // 5 batteries * 5 = 25
    // 1 water tier1 * 8 = 8
    // 0 o2 tier1 * 10 = 0
    // 1 greenhouse * 10 = 10
    // 2 shield layers * 12 = 24
    // 3 spares * 3 = 9
    // Total = 20 + 6 + 25 + 8 + 0 + 10 + 24 + 9 = 102
    const expectedMass = 102;

    expect(massUsed(referenceDesign, params)).toBe(expectedMass);
    expect(isWithinBudget(referenceDesign, params)).toBe(true);
  });

  it('correctly identifies over-budget designs as invalid (AC6)', () => {
    const heavyDesign: Design = {
      site: 'crater_edge',
      panels: 8,
      mastLevel: 3,
      batteries: 12,
      waterLoopTier: 1,
      o2LoopTier: 1,
      greenhouseModules: 3,
      shieldingLayers: 3,
      spares: {
        co2_scrubber: 2,
        o2_generator: 2,
        water_processor: 2,
        power_array: 2,
      },
    };

    // Hand calculation:
    // 8 * 5 = 40
    // 3 * 6 = 18
    // 12 * 5 = 60
    // 1 * 8 = 8
    // 1 * 10 = 10
    // 3 * 10 = 30
    // 3 * 12 = 36
    // 8 spares * 3 = 24
    // Total = 40 + 18 + 60 + 8 + 10 + 30 + 36 + 24 = 226 mu > budget (120 mu)
    const expectedMass = 226;

    expect(massUsed(heavyDesign, params)).toBe(expectedMass);
    expect(isWithinBudget(heavyDesign, params)).toBe(false);
  });

  it('handles minimal design mass within budget', () => {
    const minimalDesign: Design = {
      site: 'ridge',
      panels: 1,
      mastLevel: 0,
      batteries: 1,
      waterLoopTier: 0,
      o2LoopTier: 0,
      greenhouseModules: 0,
      shieldingLayers: 0,
      spares: {
        co2_scrubber: 0,
        o2_generator: 0,
        water_processor: 0,
        power_array: 0,
      },
    };

    // 1 * 5 + 0 + 1 * 5 + 0 + 0 + 0 + 0 + 0 = 10
    expect(massUsed(minimalDesign, params)).toBe(10);
    expect(isWithinBudget(minimalDesign, params)).toBe(true);
  });
});
