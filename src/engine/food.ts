// Food stores, greenhouse yield, and caloric balance
// Spec B5.4 (Step 7), B5.5

import { LoadedParams } from './params.ts';

export interface FoodStepResult {
  nextFoodKcal: number;
  foodDemandKcal: number;
  ghYieldKcal: number;
  foodDeficit: boolean;
}

/**
 * Calculates hourly food decrement, greenhouse production, and deficit status.
 * Spec B5.4 Step 7:
 * foodDemand = crew.size * crew.food_kcal_per_day / 24
 * ghYield = greenhouse_powered ? modules * (greenhouse.kcal_per_module_per_day / 24) * (ghLow ? greenhouse.low_power_factor : 1) : 0
 * foodKcal -= (foodDemand - ghYield)
 * If foodKcal < 0: clamp foodKcal = 0, flag food deficit.
 */
export function stepFood(
  currentFoodKcal: number,
  greenhouseModules: number,
  isGreenhousePowered: boolean,
  isGhLowPower: boolean,
  laborFraction: number,
  params: LoadedParams,
): FoodStepResult {
  const crewSize = params.getNumber('crew.size');
  const foodKcalPerDay = params.getNumber('crew.food_kcal_per_day');
  const ghKcalPerModulePerDay = params.getNumber('greenhouse.kcal_per_module_per_day');
  const ghLowPowerFactor = params.getNumber('greenhouse.low_power_factor');

  const foodDemandKcal = (crewSize * foodKcalPerDay) / 24;

  let ghYieldKcal = 0;
  if (isGreenhousePowered && greenhouseModules > 0) {
    const baseHourlyYield = greenhouseModules * (ghKcalPerModulePerDay / 24);
    const powerMultiplier = isGhLowPower ? ghLowPowerFactor : 1;
    // Scale by power mode and labor availability fraction
    ghYieldKcal = baseHourlyYield * powerMultiplier * Math.max(0, Math.min(1, laborFraction));
  }

  const netDecrement = foodDemandKcal - ghYieldKcal;
  let nextFoodKcal = currentFoodKcal - netDecrement;
  let foodDeficit = false;

  if (nextFoodKcal <= 0) {
    nextFoodKcal = 0;
    foodDeficit = true;
  }

  return {
    nextFoodKcal,
    foodDemandKcal,
    ghYieldKcal,
    foodDeficit,
  };
}
