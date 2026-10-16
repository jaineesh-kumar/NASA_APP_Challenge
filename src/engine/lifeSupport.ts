// Life support systems: oxygen, CO2, water recovery, and Sabatier cycle
// Spec B5.4 (Steps 5 and 6), B5.6

import { LoadedParams } from './params.ts';
import { Design, FailureCause } from './types.ts';

export interface DeficitCounters {
  oxygen: number;
  co2: number;
  water: number;
  food: number;
  dose: number;
}

export interface LifeSupportState {
  waterKg: number;
  o2TankKg: number;
  co2Kg: number;
  counters: DeficitCounters;
}

export interface LifeSupportStepResult {
  waterKg: number;
  o2TankKg: number;
  co2Kg: number;
  waterGross: number;
  waterNet: number;
  electrolysisWater: number;
  o2Gross: number;
  o2Net: number;
  co2Produced: number;
  co2Scrubbed: number;
  o2Deficit: boolean;
  waterDeficit: boolean;
  co2Excess: boolean;
  counters: DeficitCounters;
  survived: boolean;
  failureCause: FailureCause | null;
}

/**
 * Creates initial life support state before tick 0.
 * Spec B5.4 Step 0.
 */
export function createInitialLifeSupportState(
  design: Design,
  params: LoadedParams,
): LifeSupportState {
  const startWaterKg = params.getNumber(`site.${design.site}.start_water_kg`);
  const startO2TankKg = params.getNumber('start.o2_tank_kg');

  return {
    waterKg: startWaterKg,
    o2TankKg: startO2TankKg,
    co2Kg: 0,
    counters: {
      oxygen: 0,
      co2: 0,
      water: 0,
      food: 0,
      dose: 0,
    },
  };
}

/**
 * Executes a single hourly tick of life support mass balance and loss counters.
 * Spec B5.4 Steps 5 and 6.
 */
export function stepLifeSupport(
  currentState: LifeSupportState,
  design: Design,
  lifeSupportPowered: boolean,
  waterProcessorOk: boolean,
  o2GeneratorOk: boolean,
  co2ScrubberOk: boolean,
  greenhouseWaterKg: number,
  params: LoadedParams,
  foodDeficitActive = false,
  doseLimitExceeded = false,
): LifeSupportStepResult {
  const crewSize = params.getNumber('crew.size');
  const waterTotalKgPerDay = params.getNumber('crew.water_total_kg_per_day');
  const recoveryBase = params.getNumber('water.recovery_base');
  const recoveryUpgraded = params.getNumber('water.recovery_upgraded');

  const o2KgPerDay = params.getNumber('crew.o2_kg_per_day');
  const sabatierRecovery = params.getNumber('o2.sabatier_recovery');
  const electrolysisWaterPerO2 = params.getNumber('o2.electrolysis_water_per_o2');

  const co2KgPerDay = params.getNumber('crew.co2_kg_per_day');
  const scrubberCapacityFactor = params.getNumber('co2.scrubber_capacity_factor');
  const cabinLimitKg = params.getNumber('co2.cabin_limit_kg');

  // Step 5: Life support mass balance
  // Water
  const waterGross = (crewSize * waterTotalKgPerDay) / 24;
  const waterRecoveryRate = design.waterLoopTier === 1 ? recoveryUpgraded : recoveryBase;
  const isWaterRecoveryActive = waterProcessorOk && lifeSupportPowered;
  const waterRecovery = waterRecoveryRate * (isWaterRecoveryActive ? 1 : 0);
  const waterNet = waterGross * (1 - waterRecovery) + greenhouseWaterKg;

  // Oxygen
  const o2Gross = (crewSize * o2KgPerDay) / 24;
  const isO2RecoveryActive = o2GeneratorOk && lifeSupportPowered;
  const o2Recovery =
    (design.o2LoopTier === 1 ? sabatierRecovery : 0) * (isO2RecoveryActive ? 1 : 0);
  const o2Net = o2Gross * (1 - o2Recovery);

  // Electrolysis for Sabatier: when o2Recovery > 0, consume additional water
  let electrolysisWater = 0;
  if (o2Recovery > 0) {
    electrolysisWater = o2Gross * o2Recovery * electrolysisWaterPerO2;
  }

  // Apply water change
  const totalWaterConsumed = waterNet + electrolysisWater;
  let nextWaterKg = currentState.waterKg - totalWaterConsumed;
  let waterDeficit = false;
  if (nextWaterKg <= 0) {
    nextWaterKg = 0;
    waterDeficit = true;
  }

  // Apply O2 change
  let nextO2TankKg = currentState.o2TankKg - o2Net;
  let o2Deficit = false;
  if (nextO2TankKg <= 0) {
    nextO2TankKg = 0;
    o2Deficit = true;
  }

  // CO2
  const co2Produced = (crewSize * co2KgPerDay) / 24;
  let co2Scrubbed = 0;
  let nextCo2Kg = currentState.co2Kg;

  if (co2ScrubberOk && lifeSupportPowered) {
    const maxScrubberCapacity = crewSize * (co2KgPerDay / 24) * scrubberCapacityFactor;
    co2Scrubbed = Math.min(currentState.co2Kg + co2Produced, maxScrubberCapacity);
    nextCo2Kg = Math.max(0, currentState.co2Kg + co2Produced - co2Scrubbed);
  } else {
    nextCo2Kg = currentState.co2Kg + co2Produced;
  }

  const co2Excess = nextCo2Kg > cabinLimitKg;

  // Step 6: Loss counters
  // Increment on deficit, reset on recovery (except dose, which is cumulative)
  const nextCounters: DeficitCounters = {
    oxygen: o2Deficit ? currentState.counters.oxygen + 1 : 0,
    co2: co2Excess ? currentState.counters.co2 + 1 : 0,
    water: waterDeficit ? currentState.counters.water + 1 : 0,
    food: foodDeficitActive ? currentState.counters.food + 1 : 0,
    dose: doseLimitExceeded ? currentState.counters.dose + 1 : currentState.counters.dose,
  };

  const o2Threshold = params.getNumber('loss.o2_deficit_hours');
  const co2Threshold = params.getNumber('loss.co2_over_hours');
  const waterThreshold = params.getNumber('loss.water_deficit_hours');
  const foodThreshold = params.getNumber('loss.food_shortfall_hours');

  // Check triggers in priority order: oxygen, co2, water, food, dose
  let survived = true;
  let failureCause: FailureCause | null = null;

  if (nextCounters.oxygen > o2Threshold) {
    survived = false;
    failureCause = 'oxygen';
  } else if (nextCounters.co2 > co2Threshold) {
    survived = false;
    failureCause = 'co2';
  } else if (nextCounters.water > waterThreshold) {
    survived = false;
    failureCause = 'water';
  } else if (nextCounters.food > foodThreshold) {
    survived = false;
    failureCause = 'food';
  } else if (nextCounters.dose > 0) {
    survived = false;
    failureCause = 'dose';
  }

  return {
    waterKg: nextWaterKg,
    o2TankKg: nextO2TankKg,
    co2Kg: nextCo2Kg,
    waterGross,
    waterNet,
    electrolysisWater,
    o2Gross,
    o2Net,
    co2Produced,
    co2Scrubbed,
    o2Deficit,
    waterDeficit,
    co2Excess,
    counters: nextCounters,
    survived,
    failureCause,
  };
}
