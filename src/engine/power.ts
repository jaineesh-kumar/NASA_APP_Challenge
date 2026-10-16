// Power generation, dust factors, allocation ladder, and battery dynamics
// Spec B5.4 (Steps 3 and 4), B5.5

import { LoadedParams } from './params.ts';
import { Design, LoadId, Rules } from './types.ts';

export interface PowerDemands {
  life_support: number;
  thermal: number;
  comms: number;
  greenhouse: number;
  science: number;
  construction: number;
}

export interface PowerAllocationResult {
  poweredLoads: Set<LoadId>;
  demands: PowerDemands;
  suppliedKw: number;
  unmetLoads: Set<LoadId>;
}

export interface PowerStepResult {
  genKw: number;
  availableKw: number;
  suppliedKw: number;
  nextBatteryKwh: number;
  batteryCapacityKwh: number;
  poweredLoads: Set<LoadId>;
  unmetLoads: Set<LoadId>;
  demands: PowerDemands;
}

/**
 * Calculates instantaneous solar array generation in kW.
 * Spec B5.4 Step 3:
 * genKw = panels * power.panel_kw * sun * dustFactor * arrayFactor
 */
export function computeGeneration(
  panels: number,
  inDarkWindow: boolean,
  isDustActive: boolean,
  isArrayFailed: boolean,
  params: LoadedParams,
): number {
  const panelKw = params.getNumber('power.panel_kw');
  const dustFactorValue = params.getNumber('power.dust_factor');
  const arrayFailureFactor = params.getNumber('power.array_failure_factor');

  const sun = inDarkWindow ? 0 : 1;
  const dustFactor = isDustActive ? dustFactorValue : 1;
  const arrayFactor = isArrayFailed ? arrayFailureFactor : 1;

  return panels * panelKw * sun * dustFactor * arrayFactor;
}

/**
 * Computes individual load power demands in kW.
 * Spec B5.4 Step 4 Demands.
 */
export function computeDemands(
  design: Design,
  inDarkWindow: boolean,
  ghLow: boolean,
  pauseScience: boolean,
  isSheltering: boolean,
  allDesignedShieldsBuilt: boolean,
  forcedOff: ReadonlySet<LoadId>,
  params: LoadedParams,
): PowerDemands {
  const lifeSupportKw = params.getNumber('load.life_support_kw');
  const thermalKw = params.getNumber('load.thermal_kw');
  const thermalDarkMultiplier = params.getNumber('power.thermal_dark_multiplier');
  const commsKw = params.getNumber('load.comms_kw');
  const greenhouseKwPerModule = params.getNumber('load.greenhouse_kw_per_module');
  const greenhouseLowPowerFactor = params.getNumber('greenhouse.low_power_factor');
  const scienceKw = params.getNumber('load.science_kw');
  const constructionKw = params.getNumber('load.construction_kw');

  const thermalDemand = thermalKw * (inDarkWindow ? thermalDarkMultiplier : 1);
  const ghFactor = ghLow ? greenhouseLowPowerFactor : 1;
  const greenhouseDemand = design.greenhouseModules * greenhouseKwPerModule * ghFactor;
  const scienceDemand = pauseScience || isSheltering ? 0 : scienceKw;
  const constructionDemand = allDesignedShieldsBuilt || isSheltering ? 0 : constructionKw;

  return {
    life_support: forcedOff.has('life_support') ? 0 : lifeSupportKw,
    thermal: forcedOff.has('thermal') ? 0 : thermalDemand,
    comms: forcedOff.has('comms') ? 0 : commsKw,
    greenhouse: forcedOff.has('greenhouse') ? 0 : greenhouseDemand,
    science: forcedOff.has('science') ? 0 : scienceDemand,
    construction: forcedOff.has('construction') ? 0 : constructionDemand,
  };
}

/**
 * Allocates available power across loads using the priority ladder (all-or-nothing).
 * Spec B5.4 Step 4:
 * Walk rules.priority from index 0 to 5.
 * A load is powered if its demand is at most remaining power, otherwise off.
 */
export function allocatePower(
  availableKw: number,
  priority: readonly LoadId[],
  demands: PowerDemands,
): PowerAllocationResult {
  let remainingKw = availableKw;
  const poweredLoads = new Set<LoadId>();
  const unmetLoads = new Set<LoadId>();
  let suppliedKw = 0;

  for (let i = 0; i < priority.length; i++) {
    const loadId = priority[i];
    if (!loadId) continue;

    const demand = demands[loadId];
    if (demand <= remainingKw) {
      poweredLoads.add(loadId);
      suppliedKw += demand;
      remainingKw -= demand;
    } else {
      unmetLoads.add(loadId);
    }
  }

  return {
    poweredLoads,
    demands,
    suppliedKw,
    unmetLoads,
  };
}

/**
 * Computes battery state of charge for the next tick.
 * Spec B5.4 Step 4:
 * If genKw >= supplied: batteryKwh = min(capacity, batteryKwh + (genKw - supplied) * power.charge_efficiency)
 * else batteryKwh -= (supplied - genKw)
 */
export function updateBattery(
  currentBatteryKwh: number,
  capacityKwh: number,
  genKw: number,
  suppliedKw: number,
  params: LoadedParams,
): number {
  const chargeEfficiency = params.getNumber('power.charge_efficiency');

  if (genKw >= suppliedKw) {
    const surplus = genKw - suppliedKw;
    const addedEnergy = surplus * chargeEfficiency;
    return Math.min(capacityKwh, currentBatteryKwh + addedEnergy);
  } else {
    const deficit = suppliedKw - genKw;
    return Math.max(0, currentBatteryKwh - deficit);
  }
}

/**
 * Executes full per-tick power step (generation, demand calculation, priority allocation, battery update).
 */
export function stepPower(
  design: Design,
  rules: Rules,
  currentBatteryKwh: number,
  inDarkWindow: boolean,
  isDustActive: boolean,
  isArrayFailed: boolean,
  ghLow: boolean,
  pauseScience: boolean,
  isSheltering: boolean,
  allDesignedShieldsBuilt: boolean,
  forcedOff: ReadonlySet<LoadId>,
  params: LoadedParams,
): PowerStepResult {
  const batteryKwhPerUnit = params.getNumber('power.battery_kwh_per_unit');
  const batteryCapacityKwh = design.batteries * batteryKwhPerUnit;

  const genKw = computeGeneration(design.panels, inDarkWindow, isDustActive, isArrayFailed, params);

  const availableKw = genKw + currentBatteryKwh;

  const demands = computeDemands(
    design,
    inDarkWindow,
    ghLow,
    pauseScience,
    isSheltering,
    allDesignedShieldsBuilt,
    forcedOff,
    params,
  );

  const allocation = allocatePower(availableKw, rules.priority, demands);

  const nextBatteryKwh = updateBattery(
    currentBatteryKwh,
    batteryCapacityKwh,
    genKw,
    allocation.suppliedKw,
    params,
  );

  return {
    genKw,
    availableKw,
    suppliedKw: allocation.suppliedKw,
    nextBatteryKwh,
    batteryCapacityKwh,
    poweredLoads: allocation.poweredLoads,
    unmetLoads: allocation.unmetLoads,
    demands,
  };
}
