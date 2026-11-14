import { describe, expect, it } from 'vitest';
import { allocateCrewTime, CrewInputs, crewTaskOrder } from '../../src/engine/crew.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { goldenDesign, k } from './fixtures.ts';

const base: CrewInputs = {
  isSheltering: false,
  repairFirst: false,
  pauseScience: false,
  isGreenhousePowered: true,
  isSciencePowered: true,
  isConstructionPowered: true,
  shieldBuilt: 0,
  shieldProgressH: 0,
  repairsLeftH: { o2_generator: 10 },
};

describe('crew hours (L4 AC4, AC5)', () => {
  it('AC4: hours allocated never exceed the pool', () => {
    const rng = mulberry32(21);
    for (let i = 0; i < 2000; i++) {
      const r = allocateCrewTime(
        { ...goldenDesign, greenhouseModules: (i % 4) as 0 | 1 | 2 | 3 },
        {
          isSheltering: rng() < 0.1,
          repairFirst: rng() < 0.5,
          pauseScience: rng() < 0.3,
          isGreenhousePowered: rng() < 0.8,
          isSciencePowered: rng() < 0.8,
          isConstructionPowered: rng() < 0.8,
          shieldBuilt: Math.floor(rng() * 3),
          shieldProgressH: rng() * 30,
          repairsLeftH: rng() < 0.5 ? { co2_scrubber: rng() * 6, power_array: Infinity } : {},
        },
        k,
      );
      const used = r.hours.greenhouse + r.hours.science + r.hours.construction + r.hours.repairs;
      expect(used).toBeLessThanOrEqual(r.poolH + 1e-12);
      expect(r.poolH).toBeLessThanOrEqual(k.crewPoolHPerTick);
    }
  });

  it('AC5: repairFirst moves repairs from last to first', () => {
    expect(crewTaskOrder(false, false)).toEqual([
      'greenhouse',
      'science',
      'construction',
      'repairs',
    ]);
    expect(crewTaskOrder(true, false)).toEqual([
      'repairs',
      'greenhouse',
      'science',
      'construction',
    ]);
    expect(crewTaskOrder(false, true)).not.toContain('science');

    const normal = allocateCrewTime(goldenDesign, base, k);
    const first = allocateCrewTime(goldenDesign, { ...base, repairFirst: true }, k);
    expect(first.hours.repairs).toBeGreaterThan(normal.hours.repairs);
    expect(first.hours.repairs).toBeCloseTo(Math.min(k.crewPoolHPerTick, 10), 12);
  });

  it('sheltering empties the pool; permanent failures get no repair hours', () => {
    expect(allocateCrewTime(goldenDesign, { ...base, isSheltering: true }, k).poolH).toBe(0);
    const r = allocateCrewTime(
      goldenDesign,
      { ...base, repairFirst: true, repairsLeftH: { o2_generator: Infinity } },
      k,
    );
    expect(r.hours.repairs).toBe(0);
  });

  it('a layer completes when construction hours reach the per-layer target', () => {
    const r = allocateCrewTime(
      { ...goldenDesign, greenhouseModules: 0 },
      {
        ...base,
        isSciencePowered: false,
        shieldProgressH: k.hoursPerShieldLayer - 0.1,
        repairsLeftH: {},
      },
      k,
    );
    expect(r.isLayerCompleted).toBe(true);
    expect(r.shieldBuilt).toBe(1);
  });
});
