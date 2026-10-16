import { describe, expect, it } from 'vitest';
import { loadParams } from '../../src/engine/params.ts';
import { stepRadiation } from '../../src/engine/radiation.ts';

describe('radiation dose accumulation and shielding (Spec B5.4 Step 9, AC5)', () => {
  const params = loadParams();
  const surfaceUsvPerDay = params.getNumber('radiation.surface_usv_per_day'); // 1369
  const hourlyBase = surfaceUsvPerDay / 24;

  it('radiation dose scales with active shield layers and shelter flag (AC5)', () => {
    // 0 layers, unshielded, no shelter, no SPE
    const step0 = stepRadiation(0, 0, false, false, params);
    expect(step0.shieldFactor).toBe(1.0);
    expect(step0.shelterFactor).toBe(1.0);
    expect(step0.hourlyDoseUsv).toBeCloseTo(hourlyBase, 6);

    // 1 layer (factor 0.67)
    const step1 = stepRadiation(0, 1, false, false, params);
    expect(step1.shieldFactor).toBe(0.67);
    expect(step1.hourlyDoseUsv).toBeCloseTo(hourlyBase * 0.67, 6);

    // 2 layers (factor 0.5) + shelter (factor 0.25)
    const step2Shelter = stepRadiation(0, 2, true, false, params);
    expect(step2Shelter.shieldFactor).toBe(0.5);
    expect(step2Shelter.shelterFactor).toBe(0.25);
    expect(step2Shelter.hourlyDoseUsv).toBeCloseTo(hourlyBase * 0.5 * 0.25, 6);

    // SPE event active (multiplier 20x)
    const speMultiplier = params.getNumber('radiation.spe_multiplier'); // 20
    const stepSpe = stepRadiation(0, 0, false, true, params);
    expect(stepSpe.speMultiplier).toBe(speMultiplier);
    expect(stepSpe.hourlyDoseUsv).toBeCloseTo(hourlyBase * speMultiplier, 6);
  });

  it('flags dose deficit when accumulated dose exceeds mission limit', () => {
    const doseLimit = params.getNumber('radiation.dose_limit_usv_mission'); // 60000
    const belowLimitStep = stepRadiation(doseLimit - 100, 0, false, false, params);
    expect(belowLimitStep.doseOverLimit).toBe(false);

    const aboveLimitStep = stepRadiation(doseLimit, 0, false, false, params);
    expect(aboveLimitStep.doseOverLimit).toBe(true);
  });
});
