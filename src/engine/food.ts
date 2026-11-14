// Stored food and greenhouse
// Spec B5.4 step 7

import { SimConstants } from './constants.ts';

export interface FoodInputs {
  modules: number;
  isGreenhousePowered: boolean;
  ghLow: boolean;
  allocatedH: number;
  neededH: number;
  waterKg: number;
}

export interface FoodStep {
  foodKcal: number;
  ghKcal: number;
  ghWaterKg: number;
  isShortfall: boolean;
}

export function stepFood(foodKcal: number, input: FoodInputs, k: SimConstants): FoodStep {
  const on = input.isGreenhousePowered && input.modules > 0;
  let ghKcal = 0;
  if (on && input.waterKg > 0) {
    const powerFactor = input.ghLow ? k.greenhouseLowPowerFactor : 1;
    const crewFactor = input.neededH > 0 ? Math.min(1, input.allocatedH / input.neededH) : 1;
    ghKcal = input.modules * k.greenhouseKcalPerModulePerH * powerFactor * crewFactor;
  }
  const ghWaterKg = on ? input.modules * k.greenhouseWaterKgPerModulePerH : 0;
  let next = foodKcal + ghKcal - k.foodNeedKcalPerH;
  const isShortfall = next < 0;
  if (isShortfall) next = 0;
  return { foodKcal: next, ghKcal, ghWaterKg, isShortfall };
}
