// Oxygen, CO2 and water loops
// Spec B5.4 step 5

import { SimConstants } from './constants.ts';
import { Design } from './types.ts';

export interface LifeSupportState {
  waterKg: number;
  o2TankKg: number;
  co2Kg: number;
}

export interface LifeSupportInputs {
  isPowered: boolean;
  isO2GeneratorOk: boolean;
  isWaterProcessorOk: boolean;
  isCo2ScrubberOk: boolean;
}

export interface LifeSupportStep extends LifeSupportState {
  o2OutKg: number; // made by the generator
  electrolysisWaterKg: number; // water split to make o2OutKg
  waterLostKg: number; // crew water not recovered
  sabatierWaterKg: number; // water returned by Sabatier
  co2ScrubbedKg: number;
  isO2Deficit: boolean; // tank could not cover this hour's need
  isWaterAtZero: boolean;
  isCo2OverLimit: boolean;
}

export function createInitialLifeSupportState(design: Design, k: SimConstants): LifeSupportState {
  return { waterKg: k.startWaterKg[design.site], o2TankKg: k.startO2TankKg, co2Kg: 0 };
}

/** Spec B5.4 step 5. If life support is unpowered, no component runs. */
export function stepLifeSupport(
  s: LifeSupportState,
  design: Design,
  input: LifeSupportInputs,
  k: SimConstants,
): LifeSupportStep {
  const on = input.isPowered;
  const o2Need = k.o2NeedKgPerH;
  let water = s.waterKg;
  let tank = s.o2TankKg;
  let co2 = s.co2Kg;

  // Oxygen: the generator splits water and tops the tank back up toward its start level.
  let o2Out = 0;
  let electrolysisWater = 0;
  let isO2Deficit = false;
  if (on && input.isO2GeneratorOk && water > 0) {
    o2Out = Math.min(o2Need * k.o2GeneratorCapacityFactor, o2Need + (k.startO2TankKg - tank));
    tank += o2Out - o2Need;
    electrolysisWater = o2Out * k.electrolysisWaterPerO2;
    water -= electrolysisWater;
  } else if (tank >= o2Need) {
    tank -= o2Need;
  } else {
    tank = 0;
    isO2Deficit = true;
  }

  // Water recovery
  const rec =
    on && input.isWaterProcessorOk
      ? design.waterLoopTier === 1
        ? k.recoveryUpgraded
        : k.recoveryBase
      : 0;
  const waterLost = k.waterGrossKgPerH * (1 - rec);
  water -= waterLost;

  // Sabatier turns captured CO2 + hydrogen back into water.
  const sabatierWater =
    design.o2LoopTier === 1 && on && input.isCo2ScrubberOk
      ? k.sabatierRecovery * o2Need * k.electrolysisWaterPerO2
      : 0;
  water += sabatierWater;

  // CO2
  co2 += k.co2ProdKgPerH;
  let scrubbed = 0;
  if (on && input.isCo2ScrubberOk) {
    scrubbed = Math.min(co2, k.co2ProdKgPerH * k.co2ScrubberCapacityFactor);
    co2 -= scrubbed;
  }

  const isWaterAtZero = water <= 0;
  if (isWaterAtZero) water = 0;

  return {
    waterKg: water,
    o2TankKg: tank,
    co2Kg: co2,
    o2OutKg: o2Out,
    electrolysisWaterKg: electrolysisWater,
    waterLostKg: waterLost,
    sabatierWaterKg: sabatierWater,
    co2ScrubbedKg: scrubbed,
    isO2Deficit,
    isWaterAtZero,
    isCo2OverLimit: co2 > k.co2CabinLimitKg,
  };
}
