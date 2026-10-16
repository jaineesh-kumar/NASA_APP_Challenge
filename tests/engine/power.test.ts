import { describe, expect, it } from 'vitest';
import { loadParams } from '../../src/engine/params.ts';
import {
  allocatePower,
  computeDemands,
  computeGeneration,
  stepPower,
  updateBattery,
} from '../../src/engine/power.ts';
import { computeDarkWindows, isHourInDarkWindow } from '../../src/engine/schedule.ts';
import { Design, LoadId, Rules } from '../../src/engine/types.ts';

describe('power generation, allocation, and battery dynamics (Spec B5.4, AC4-AC8)', () => {
  const params = loadParams();

  const standardDesign: Design = {
    site: 'ridge',
    panels: 4,
    mastLevel: 1,
    batteries: 4,
    waterLoopTier: 0,
    o2LoopTier: 0,
    greenhouseModules: 1,
    shieldingLayers: 1,
    spares: {
      co2_scrubber: 0,
      o2_generator: 0,
      water_processor: 0,
      power_array: 0,
    },
  };

  const standardPriority: LoadId[] = [
    'life_support',
    'thermal',
    'comms',
    'greenhouse',
    'science',
    'construction',
  ];

  const standardRules: Rules = {
    priority: standardPriority,
    ifThen: [],
  };

  it('priority ladder turns off lower-priority loads first during shortage (AC6)', () => {
    // Demands:
    // life_support: 5, thermal: 4, comms: 1, greenhouse: 3, science: 3, construction: 3
    const demands = computeDemands(
      standardDesign,
      false, // not dark
      false, // ghLow
      false, // pauseScience
      false, // isSheltering
      false, // allShieldsBuilt
      new Set(), // forcedOff
      params,
    );

    expect(demands.life_support).toBe(5);
    expect(demands.thermal).toBe(4);
    expect(demands.comms).toBe(1);
    expect(demands.greenhouse).toBe(3);
    expect(demands.science).toBe(3);
    expect(demands.construction).toBe(3);

    // Available is 10 kW:
    // life_support (5) -> remaining 5
    // thermal (4) -> remaining 1
    // comms (1) -> remaining 0
    // greenhouse (3 > 0) -> OFF
    // science (3 > 0) -> OFF
    // construction (3 > 0) -> OFF
    const allocation = allocatePower(10, standardPriority, demands);

    expect(allocation.suppliedKw).toBe(10);
    expect(allocation.poweredLoads.has('life_support')).toBe(true);
    expect(allocation.poweredLoads.has('thermal')).toBe(true);
    expect(allocation.poweredLoads.has('comms')).toBe(true);
    expect(allocation.poweredLoads.has('greenhouse')).toBe(false);
    expect(allocation.poweredLoads.has('science')).toBe(false);
    expect(allocation.poweredLoads.has('construction')).toBe(false);

    expect(allocation.unmetLoads).toEqual(new Set(['greenhouse', 'science', 'construction']));
  });

  it('allocates on an all-or-nothing basis and skips unaffordable loads (AC7)', () => {
    const demands = {
      life_support: 5,
      thermal: 4,
      comms: 1,
      greenhouse: 3,
      science: 3,
      construction: 3,
    };

    // If available is 6 kW:
    // life_support (5) -> remaining 1 kW
    // thermal (needs 4 > 1) -> OFF! (does not get partial 1 kW)
    // comms (needs 1 <= 1) -> ON! (uses remaining 1 kW)
    // greenhouse (needs 3 > 0) -> OFF
    const allocation = allocatePower(6, standardPriority, demands);

    expect(allocation.suppliedKw).toBe(6);
    expect(allocation.poweredLoads.has('life_support')).toBe(true);
    expect(allocation.poweredLoads.has('thermal')).toBe(false);
    expect(allocation.poweredLoads.has('comms')).toBe(true);
  });

  it('battery stays within [0, capacity] and supplied <= availableKw over 720 ticks (AC4, AC5)', () => {
    const darkWindows = computeDarkWindows('ridge', 1, params);
    const capacityKwh = standardDesign.batteries * params.getNumber('power.battery_kwh_per_unit');
    let batteryKwh = capacityKwh; // Start full per B5.4 Step 0

    for (let t = 0; t < 720; t++) {
      const inDark = isHourInDarkWindow(t, darkWindows);
      // Simulate sporadic dust events and array failures
      const isDust = t >= 100 && t <= 172;
      const isArrayFailed = t >= 250 && t <= 300;

      const step = stepPower(
        standardDesign,
        standardRules,
        batteryKwh,
        inDark,
        isDust,
        isArrayFailed,
        false, // ghLow
        false, // pauseScience
        false, // isSheltering
        false, // allShieldsBuilt
        new Set(),
        params,
      );

      // Spec AC5: supplied <= genKw + batteryKwh always
      expect(step.suppliedKw).toBeLessThanOrEqual(step.availableKw);

      // Spec AC4: battery stays within [0, capacity] over 720 ticks
      expect(step.nextBatteryKwh).toBeGreaterThanOrEqual(0);
      expect(step.nextBatteryKwh).toBeLessThanOrEqual(capacityKwh);

      batteryKwh = step.nextBatteryKwh;
    }
  });

  it('battery stays within [0, capacity] in an extreme deficit stress test (AC4)', () => {
    const capacityKwh = 400; // 4 batteries * 100
    const batteryKwh = 5; // very low battery

    // Zero generation, large demand (19 kW)
    const result1 = updateBattery(batteryKwh, capacityKwh, 0, 19, params);
    expect(result1).toBe(0); // clamped at 0, never negative

    // Large surplus, charging efficiency applied
    // gen = 100, supplied = 10 -> surplus = 90. Added = 90 * 0.9 = 81.
    const result2 = updateBattery(350, capacityKwh, 100, 10, params);
    // 350 + 81 = 431 -> capped at capacity (400)
    expect(result2).toBe(400);
  });

  it('generation formula applies dust and array factors correctly', () => {
    // 4 panels * 10 kW/panel = 40 kW base
    const baseGen = computeGeneration(4, false, false, false, params);
    expect(baseGen).toBe(40);

    // Dark window: 0 kW
    const darkGen = computeGeneration(4, true, false, false, params);
    expect(darkGen).toBe(0);

    // Dust event: 40 * 0.85 = 34 kW
    const dustGen = computeGeneration(4, false, true, false, params);
    expect(dustGen).toBeCloseTo(34, 5);

    // Array failure: 40 * 0.75 = 30 kW
    const failGen = computeGeneration(4, false, false, true, params);
    expect(failGen).toBeCloseTo(30, 5);

    // Dust + Array failure: 40 * 0.85 * 0.75 = 25.5 kW
    const dustFailGen = computeGeneration(4, false, true, true, params);
    expect(dustFailGen).toBeCloseTo(25.5, 5);
  });

  it('guarantees determinism: identical inputs yield identical outputs (AC8)', () => {
    const runSimulation = () => {
      const darkWindows = computeDarkWindows('crater_edge', 2, params);
      let battery = 200;
      const history: number[] = [];

      for (let t = 0; t < 100; t++) {
        const inDark = isHourInDarkWindow(t, darkWindows);
        const step = stepPower(
          standardDesign,
          standardRules,
          battery,
          inDark,
          t % 50 === 0,
          t % 80 === 0,
          false,
          false,
          false,
          false,
          new Set(),
          params,
        );
        history.push(step.suppliedKw, step.nextBatteryKwh);
        battery = step.nextBatteryKwh;
      }
      return history;
    };

    const run1 = runSimulation();
    const run2 = runSimulation();

    expect(run1).toEqual(run2);
  });
});
