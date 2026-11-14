import { describe, expect, it } from 'vitest';
import {
  createInitialLifeSupportState,
  LifeSupportInputs,
  LifeSupportState,
  stepLifeSupport,
} from '../../src/engine/lifeSupport.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { Design } from '../../src/engine/types.ts';
import { goldenDesign, k } from './fixtures.ts';

const allOk: LifeSupportInputs = {
  isPowered: true,
  isO2GeneratorOk: true,
  isWaterProcessorOk: true,
  isCo2ScrubberOk: true,
};

function randomInputs(rng: () => number): LifeSupportInputs {
  return {
    isPowered: rng() > 0.2,
    isO2GeneratorOk: rng() > 0.2,
    isWaterProcessorOk: rng() > 0.2,
    isCo2ScrubberOk: rng() > 0.2,
  };
}

function run(design: Design, seed: number, hours = k.missionHours) {
  const rng = mulberry32(seed);
  let s: LifeSupportState = createInitialLifeSupportState(design, k);
  const steps = [];
  for (let t = 0; t < hours; t++) {
    const st = stepLifeSupport(s, design, randomInputs(rng), k);
    steps.push(st);
    s = st;
  }
  return steps;
}

describe('life support (L3 AC1-AC7)', () => {
  it('AC1: water change = returns - draws within 1e-9 (while water stays above zero)', () => {
    const d: Design = { ...goldenDesign, o2LoopTier: 1, site: 'crater_edge' };
    let s = createInitialLifeSupportState(d, k);
    const rng = mulberry32(11);
    for (let t = 0; t < 200; t++) {
      const st = stepLifeSupport(s, d, randomInputs(rng), k);
      const expected = s.waterKg - st.electrolysisWaterKg - st.waterLostKg + st.sabatierWaterKg;
      expect(st.isWaterAtZero).toBe(false);
      expect(Math.abs(st.waterKg - expected)).toBeLessThan(1e-9);
      s = st;
    }
  });

  it('AC2: oxygen tank change = output - need (unless the tank ran dry)', () => {
    let s = createInitialLifeSupportState(goldenDesign, k);
    const rng = mulberry32(5);
    for (let t = 0; t < 300; t++) {
      const st = stepLifeSupport(s, goldenDesign, randomInputs(rng), k);
      if (!st.isO2Deficit) {
        expect(Math.abs(st.o2TankKg - s.o2TankKg - (st.o2OutKg - k.o2NeedKgPerH))).toBeLessThan(
          1e-9,
        );
      }
      s = st;
    }
  });

  it('AC3: with the scrubber off, cabin CO2 rises by co2Prod each tick', () => {
    let s = createInitialLifeSupportState(goldenDesign, k);
    for (let t = 0; t < 10; t++) {
      const st = stepLifeSupport(s, goldenDesign, { ...allOk, isCo2ScrubberOk: false }, k);
      expect(st.co2Kg - s.co2Kg).toBeCloseTo(k.co2ProdKgPerH, 12);
      s = st;
    }
  });

  it('AC4: water tier 1 never uses more water than tier 0', () => {
    const t0 = run({ ...goldenDesign, waterLoopTier: 0 }, 9);
    const t1 = run({ ...goldenDesign, waterLoopTier: 1 }, 9);
    t0.forEach((a, i) => expect(t1[i]?.waterKg ?? 0).toBeGreaterThanOrEqual(a.waterKg - 1e-9));
  });

  it('AC5: o2 tier 1 (Sabatier) never uses more water than tier 0', () => {
    const t0 = run({ ...goldenDesign, o2LoopTier: 0 }, 13);
    const t1 = run({ ...goldenDesign, o2LoopTier: 1 }, 13);
    t0.forEach((a, i) => expect(t1[i]?.waterKg ?? 0).toBeGreaterThanOrEqual(a.waterKg - 1e-9));
  });

  it('AC6: unpowered life support stops all three components', () => {
    const s = createInitialLifeSupportState({ ...goldenDesign, o2LoopTier: 1 }, k);
    const st = stepLifeSupport(
      s,
      { ...goldenDesign, o2LoopTier: 1 },
      { ...allOk, isPowered: false },
      k,
    );
    expect(st.o2OutKg).toBe(0);
    expect(st.co2ScrubbedKg).toBe(0);
    expect(st.sabatierWaterKg).toBe(0);
    expect(st.waterLostKg).toBeCloseTo(k.waterGrossKgPerH, 12);
  });

  it('AC7: the deficit flag clears when the condition clears', () => {
    const empty: LifeSupportState = { waterKg: 100, o2TankKg: 0, co2Kg: 0 };
    const off = { ...allOk, isO2GeneratorOk: false };
    expect(stepLifeSupport(empty, goldenDesign, off, k).isO2Deficit).toBe(true);
    expect(stepLifeSupport(empty, goldenDesign, allOk, k).isO2Deficit).toBe(false);
  });

  it('the oxygen generator never fills the tank past its start level', () => {
    const s = createInitialLifeSupportState(goldenDesign, k);
    const st = stepLifeSupport(s, goldenDesign, allOk, k);
    expect(st.o2TankKg).toBeLessThanOrEqual(k.startO2TankKg + 1e-9);
  });
});
