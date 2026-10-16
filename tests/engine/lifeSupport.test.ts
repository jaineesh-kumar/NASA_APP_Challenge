import { describe, expect, it } from 'vitest';
import { createInitialLifeSupportState, stepLifeSupport } from '../../src/engine/lifeSupport.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design } from '../../src/engine/types.ts';

describe('life support systems and loss counters (Spec B5.4 Steps 5-6, AC1-AC7)', () => {
  const params = loadParams();

  const baseDesign: Design = {
    site: 'ridge',
    panels: 4,
    mastLevel: 1,
    batteries: 4,
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

  it('water consumed per tick matches crew.size * crew.water_total_kg_per_day / 24 (AC1)', () => {
    const initialState = createInitialLifeSupportState(baseDesign, params);
    const step = stepLifeSupport(
      initialState,
      baseDesign,
      true, // lifeSupportPowered
      true, // waterProcessorOk
      true, // o2GeneratorOk
      true, // co2ScrubberOk
      0, // greenhouseWaterKg
      params,
    );

    const expectedWaterGross =
      (params.getNumber('crew.size') * params.getNumber('crew.water_total_kg_per_day')) / 24;
    expect(step.waterGross).toBeCloseTo(expectedWaterGross, 6);
    expect(step.waterGross).toBeCloseTo(0.725, 6);
  });

  it('upgraded water recovery consumes less net water than base recovery (AC2)', () => {
    const upgradedDesign: Design = {
      ...baseDesign,
      waterLoopTier: 1,
    };

    const stateBase = createInitialLifeSupportState(baseDesign, params);
    const stepBase = stepLifeSupport(stateBase, baseDesign, true, true, true, true, 0, params);

    const stateUpgraded = createInitialLifeSupportState(upgradedDesign, params);
    const stepUpgraded = stepLifeSupport(
      stateUpgraded,
      upgradedDesign,
      true,
      true,
      true,
      true,
      0,
      params,
    );

    // Base recovery = 90% (net = 10%)
    // Upgraded recovery = 98% (net = 2%)
    expect(stepUpgraded.waterNet).toBeLessThan(stepBase.waterNet);
    expect(stepBase.waterNet).toBeCloseTo(0.725 * 0.1, 5);
    expect(stepUpgraded.waterNet).toBeCloseTo(0.725 * 0.02, 5);
  });

  it('tier 1 O2 loop (Sabatier) cuts net O2 consumption by exactly o2.sabatier_recovery (AC3)', () => {
    const sabatierDesign: Design = {
      ...baseDesign,
      o2LoopTier: 1,
    };

    const state0 = createInitialLifeSupportState(baseDesign, params);
    const step0 = stepLifeSupport(state0, baseDesign, true, true, true, true, 0, params);

    const state1 = createInitialLifeSupportState(sabatierDesign, params);
    const step1 = stepLifeSupport(state1, sabatierDesign, true, true, true, true, 0, params);

    const sabatierFraction = params.getNumber('o2.sabatier_recovery'); // 0.5
    expect(step0.o2Net).toBeCloseTo(step0.o2Gross, 6);
    expect(step1.o2Net).toBeCloseTo(step0.o2Gross * (1 - sabatierFraction), 6);
    expect(step1.electrolysisWater).toBeGreaterThan(0);
  });

  it('failed scrubber lets CO2 rise (AC4)', () => {
    let state = createInitialLifeSupportState(baseDesign, params);
    expect(state.co2Kg).toBe(0);

    for (let h = 0; h < 5; h++) {
      const step = stepLifeSupport(
        state,
        baseDesign,
        true,
        true,
        true,
        false, // co2ScrubberOk = false
        0,
        params,
      );
      expect(step.co2Kg).toBeGreaterThan(state.co2Kg);
      state = {
        waterKg: step.waterKg,
        o2TankKg: step.o2TankKg,
        co2Kg: step.co2Kg,
        counters: step.counters,
      };
    }

    const expectedHourlyCo2 =
      (params.getNumber('crew.size') * params.getNumber('crew.co2_kg_per_day')) / 24;
    expect(state.co2Kg).toBeCloseTo(5 * expectedHourlyCo2, 5);
  });

  it('scrubber recovers cabin CO2 toward 0 when powered (AC5)', () => {
    // Start with elevated CO2
    const elevatedState = {
      ...createInitialLifeSupportState(baseDesign, params),
      co2Kg: 1.5,
    };

    let state = elevatedState;
    for (let h = 0; h < 25; h++) {
      const step = stepLifeSupport(
        state,
        baseDesign,
        true,
        true,
        true,
        true, // scrubber working
        0,
        params,
      );
      state = {
        waterKg: step.waterKg,
        o2TankKg: step.o2TankKg,
        co2Kg: step.co2Kg,
        counters: step.counters,
      };
    }

    // Capacity factor is 1.5x production, so excess CO2 decreases to 0
    expect(state.co2Kg).toBe(0);
  });

  it('failure counters increment on deficit and reset on recovery (AC6)', () => {
    let state = {
      ...createInitialLifeSupportState(baseDesign, params),
      o2TankKg: 0, // In O2 deficit
    };

    // Hour 1
    let step = stepLifeSupport(state, baseDesign, true, true, true, true, 0, params);
    expect(step.counters.oxygen).toBe(1);

    // Hour 2
    state = { ...state, counters: step.counters };
    step = stepLifeSupport(state, baseDesign, true, true, true, true, 0, params);
    expect(step.counters.oxygen).toBe(2);

    // Recovery: O2 tank refilled
    state = { ...state, o2TankKg: 100, counters: step.counters };
    step = stepLifeSupport(state, baseDesign, true, true, true, true, 0, params);
    expect(step.counters.oxygen).toBe(0); // Reset on recovery
  });

  it('deficit exceeding loss.*_deficit_hours sets survived: false and matching failureCause (AC7)', () => {
    const o2Threshold = params.getNumber('loss.o2_deficit_hours'); // 3
    let state = {
      ...createInitialLifeSupportState(baseDesign, params),
      o2TankKg: 0,
    };

    // Run up to threshold
    for (let h = 0; h < o2Threshold; h++) {
      const step = stepLifeSupport(state, baseDesign, true, true, true, true, 0, params);
      expect(step.survived).toBe(true);
      expect(step.failureCause).toBeNull();
      state = { ...state, counters: step.counters };
    }

    // Next hour: exceeds threshold -> triggers failure
    const fatalStep = stepLifeSupport(state, baseDesign, true, true, true, true, 0, params);
    expect(fatalStep.survived).toBe(false);
    expect(fatalStep.failureCause).toBe('oxygen');
  });

  it('triggers CO2 failure when CO2 limit is exceeded for longer than threshold', () => {
    const co2Threshold = params.getNumber('loss.co2_over_hours'); // 6
    let state = {
      ...createInitialLifeSupportState(baseDesign, params),
      co2Kg: 5.0, // well above limit of 2.0 kg
    };

    for (let h = 0; h < co2Threshold; h++) {
      const step = stepLifeSupport(state, baseDesign, true, true, true, false, 0, params);
      expect(step.survived).toBe(true);
      state = { ...state, co2Kg: step.co2Kg, counters: step.counters };
    }

    // Exceeds threshold
    const fatalStep = stepLifeSupport(state, baseDesign, true, true, true, false, 0, params);
    expect(fatalStep.survived).toBe(false);
    expect(fatalStep.failureCause).toBe('co2');
  });
});
