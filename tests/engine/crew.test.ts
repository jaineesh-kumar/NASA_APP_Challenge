import { describe, expect, it } from 'vitest';
import { allocateCrewTime } from '../../src/engine/crew.ts';
import { loadParams } from '../../src/engine/params.ts';
import { Design } from '../../src/engine/types.ts';

describe('crew time allocation, repairs, and shield construction (Spec B5.4 Step 8, AC3, AC4, AC9)', () => {
  const params = loadParams();

  const standardDesign: Design = {
    site: 'ridge',
    panels: 4,
    mastLevel: 1,
    batteries: 4,
    waterLoopTier: 0,
    o2LoopTier: 0,
    greenhouseModules: 2,
    shieldingLayers: 2,
    spares: {
      co2_scrubber: 1,
      o2_generator: 1,
      water_processor: 1,
      power_array: 1,
    },
  };

  it('allocates crew hours in strict order: repairs before greenhouse before construction before science (AC3)', () => {
    // Total crew hours available per hour = (4 * 8) / 24 = 1.3333... hours
    // Scenario 1: Active repair needing 1.0 hour.
    // 1.3333 total available:
    // 1.0 goes to repair -> remaining 0.3333
    // Greenhouse (2 modules * 0.2 = 0.4 demand): 0.3333 goes to greenhouse -> remaining 0
    // Construction: gets 0
    // Science: gets 0
    const activeRepairs = { co2_scrubber: 1.0 };

    const result = allocateCrewTime(
      standardDesign,
      activeRepairs,
      0, // shieldBuilt
      0, // shieldProgressH
      0, // scienceHours
      true, // ghPowered
      true, // constrPowered
      true, // sciPowered
      false, // sheltering
      false, // sciPaused
      params,
    );

    expect(result.hoursAllocated.repairs).toBeCloseTo(1.0, 5);
    expect(result.hoursAllocated.greenhouse).toBeCloseTo(0.33333, 4);
    expect(result.hoursAllocated.construction).toBe(0);
    expect(result.hoursAllocated.science).toBe(0);
    expect(result.ghLaborFraction).toBeCloseTo(0.33333 / 0.4, 4);
  });

  it('finishes shield layer when accumulated crew hours reach construction.hours_per_shield_layer (AC4)', () => {
    const hoursPerLayer = params.getNumber('construction.hours_per_shield_layer'); // 40
    // Start with 39.5 hours progress towards layer 1
    const initialProgress = hoursPerLayer - 0.5;

    const result = allocateCrewTime(
      standardDesign,
      {}, // no repairs
      0, // 0 layers built
      initialProgress,
      0,
      false, // no greenhouse
      true, // construction powered
      true,
      false,
      false,
      params,
    );

    expect(result.layerCompletedThisTick).toBe(true);
    expect(result.updatedShieldBuilt).toBe(1);
    expect(result.updatedShieldProgressH).toBe(0);
    expect(result.hoursAllocated.construction).toBeCloseTo(0.5, 5);
    // Remaining crew time (1.3333 - 0.5 = 0.8333) cascades into science (capped at max 0.6)
    expect(result.hoursAllocated.science).toBeCloseTo(0.6, 5);
  });

  it('repair finishes after required crew hours and marks component ok (AC9)', () => {
    const repairHoursNeeded = params.getNumber('repair.hours.co2_scrubber'); // 6
    expect(repairHoursNeeded).toBe(6);
    // Suppose 1.0 hour remaining on scrubber
    const activeRepairs = { co2_scrubber: 1.0 };

    const result = allocateCrewTime(
      standardDesign,
      activeRepairs,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      false,
      params,
    );

    expect(result.hoursAllocated.repairs).toBeCloseTo(1.0, 5);
    expect(result.repairedThisTick).toContain('co2_scrubber');
    expect(result.remainingRepairs['co2_scrubber']).toBeUndefined();
  });
});
