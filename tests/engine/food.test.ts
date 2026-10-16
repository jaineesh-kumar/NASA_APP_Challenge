import { describe, expect, it } from 'vitest';
import { stepFood } from '../../src/engine/food.ts';
import { loadParams } from '../../src/engine/params.ts';

describe('food stores and greenhouse yields (Spec B5.4 Step 7, AC1, AC2)', () => {
  const params = loadParams();

  it('food decreases each tick by crew.size * crew.food_kcal_per_day / 24 minus greenhouse yield (AC1)', () => {
    const startFood = 10000;
    const crewSize = params.getNumber('crew.size');
    const foodKcalPerDay = params.getNumber('crew.food_kcal_per_day');
    const expectedHourlyDemand = (crewSize * foodKcalPerDay) / 24; // (4 * 2500) / 24 = 416.666...

    // No greenhouse
    const step0 = stepFood(startFood, 0, false, false, 1.0, params);
    expect(step0.foodDemandKcal).toBeCloseTo(expectedHourlyDemand, 6);
    expect(step0.ghYieldKcal).toBe(0);
    expect(step0.nextFoodKcal).toBeCloseTo(startFood - expectedHourlyDemand, 6);

    // With 1 powered greenhouse module (5000 kcal/day / 24 = 208.333...)
    const step1 = stepFood(startFood, 1, true, false, 1.0, params);
    const expectedGhYield = params.getNumber('greenhouse.kcal_per_module_per_day') / 24;
    expect(step1.ghYieldKcal).toBeCloseTo(expectedGhYield, 6);
    expect(step1.nextFoodKcal).toBeCloseTo(startFood - (expectedHourlyDemand - expectedGhYield), 6);
  });

  it('greenhouse with low power yields greenhouse.low_power_factor of base (AC2)', () => {
    const startFood = 10000;
    const fullPowerStep = stepFood(startFood, 2, true, false, 1.0, params);
    const lowPowerStep = stepFood(startFood, 2, true, true, 1.0, params);

    const lowPowerFactor = params.getNumber('greenhouse.low_power_factor'); // 0.5
    expect(lowPowerStep.ghYieldKcal).toBeCloseTo(fullPowerStep.ghYieldKcal * lowPowerFactor, 6);
  });

  it('triggers food deficit flag when food is completely depleted', () => {
    const lowFood = 50;
    const step = stepFood(lowFood, 0, false, false, 1.0, params);
    expect(step.nextFoodKcal).toBe(0);
    expect(step.foodDeficit).toBe(true);
  });
});
