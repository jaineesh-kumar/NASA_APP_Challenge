// Single mission simulation loop (720 hourly ticks)
// Spec B5.4, B5.5, B5.6

import { allocateCrewTime } from './crew.ts';
import { createInitialEventsState, stepEvents } from './events.ts';
import { stepFood } from './food.ts';
import { createInitialLifeSupportState, stepLifeSupport } from './lifeSupport.ts';
import { LoadedParams, loadParams } from './params.ts';
import { stepPower } from './power.ts';
import { stepRadiation } from './radiation.ts';
import { mulberry32 } from './rng.ts';
import { evaluateRules, RuleEvaluationState } from './rules.ts';
import { computeDarkWindows, isHourInDarkWindow } from './schedule.ts';
import { Design, FailureCause, LogEntry, MissionResult, Rules } from './types.ts';

/**
 * Runs a single 30-day lunar outpost mission simulation across 720 hourly ticks.
 * Spec B5.4 (Complete order of operations Steps 0 to 9).
 */
export function runMission(
  design: Design,
  rules: Rules,
  seed: number,
  paramsInput?: LoadedParams,
): MissionResult {
  const params = paramsInput ?? loadParams();
  const missionHours = params.getNumber('mission.hours');
  const rng = mulberry32(seed);

  // Spec B5.3: Dark-window jitter is drawn once before tick 0 in site order
  const darkWindows = computeDarkWindows(design.site, design.mastLevel, params, rng);

  // Spec B5.4 Step 0: Initial state
  const batteryKwhPerUnit = params.getNumber('power.battery_kwh_per_unit');
  const batteryCapacityKwh = design.batteries * batteryKwhPerUnit;
  let batteryKwh = batteryCapacityKwh;

  let lifeSupportState = createInitialLifeSupportState(design, params);
  let eventsState = createInitialEventsState(design);

  let foodKcal = params.getNumber('start.food_kcal');
  let shieldBuilt = 0;
  let shieldProgressH = 0;
  let scienceHours = 0;
  let doseUsv = 0;

  const crewSize = params.getNumber('crew.size');
  const o2KgPerDay = params.getNumber('crew.o2_kg_per_day');
  const dailyO2Demand = crewSize * o2KgPerDay;

  let minBatteryPct = 100;
  let minO2Days = dailyO2Demand > 0 ? lifeSupportState.o2TankKg / dailyO2Demand : 0;
  let peakDoseUsv = 0;

  const logs: LogEntry[] = [];
  let survived = true;
  let failureCause: FailureCause | null = null;
  let failureHour: number | null = null;

  let foodDeficitActive = false;
  let doseLimitExceeded = false;
  let lastGhLaborFraction = 1.0;

  // Track state of previous tick for rules evaluation
  let prevRuleState: RuleEvaluationState = {
    batteryKwh,
    batteryCapacityKwh,
    o2TankKg: lifeSupportState.o2TankKg,
    isSpeWarningActive: false,
    componentsOk: { ...eventsState.componentsOk },
    darkWindows,
  };

  for (let t = 0; t < missionHours; t++) {
    // 1. Events: scheduled dark windows, seeded draws, dust storms, SPEs, failures
    const inDarkWindow = isHourInDarkWindow(t, darkWindows);
    const wasDarkPrevious = t > 0 ? isHourInDarkWindow(t - 1, darkWindows) : false;
    if (inDarkWindow && !wasDarkPrevious) {
      logs.push({
        t,
        type: 'dark_window_start',
        detail: 'Outpost entered lunar surface dark window',
      });
    } else if (!inDarkWindow && wasDarkPrevious) {
      logs.push({
        t,
        type: 'dark_window_end',
        detail: 'Outpost exited dark window into direct sunlight',
      });
    }

    const eventsResult = stepEvents(t, eventsState, rng, params);
    eventsState = eventsResult.state;
    for (let i = 0; i < eventsResult.logs.length; i++) {
      const l = eventsResult.logs[i];
      if (l) logs.push(l);
    }

    // 2. Rules: evaluate IF-THEN rules against previous tick's state (no latching)
    prevRuleState.isSpeWarningActive = eventsResult.isSpeWarningActive;
    prevRuleState.componentsOk = { ...eventsState.componentsOk };

    const ruleResult = evaluateRules(rules, prevRuleState, t, params);
    for (let i = 0; i < ruleResult.logs.length; i++) {
      const l = ruleResult.logs[i];
      if (l) logs.push(l);
    }

    // 3 & 4. Power generation & priority allocation
    const isArrayFailed = !eventsState.componentsOk.power_array;
    const allShieldsBuilt = shieldBuilt >= design.shieldingLayers;

    const powerResult = stepPower(
      design,
      rules,
      batteryKwh,
      inDarkWindow,
      eventsResult.isDustActive,
      isArrayFailed,
      ruleResult.ghLow,
      ruleResult.pauseScience,
      ruleResult.shelter,
      allShieldsBuilt,
      ruleResult.forcedOff,
      params,
    );

    batteryKwh = powerResult.nextBatteryKwh;

    if (batteryKwh <= 0) {
      logs.push({ t, type: 'battery_empty', detail: 'Outpost energy storage fully exhausted' });
    }

    for (const unmetLoad of powerResult.unmetLoads) {
      logs.push({ t, type: 'load_off', detail: `Load shed: ${unmetLoad}` });
    }

    // 5 & 6. Life support mass balance and loss counters
    const isLifeSupportPowered = powerResult.poweredLoads.has('life_support');
    const isGreenhousePowered = powerResult.poweredLoads.has('greenhouse');
    const ghWaterPerDay = params.getNumber('greenhouse.water_kg_per_module_per_day');
    const greenhouseWaterKg = isGreenhousePowered
      ? (design.greenhouseModules * ghWaterPerDay) / 24
      : 0;

    const lsResult = stepLifeSupport(
      lifeSupportState,
      design,
      isLifeSupportPowered,
      eventsState.componentsOk.water_processor,
      eventsState.componentsOk.o2_generator,
      eventsState.componentsOk.co2_scrubber,
      greenhouseWaterKg,
      params,
      foodDeficitActive,
      doseLimitExceeded,
    );

    lifeSupportState = {
      waterKg: lsResult.waterKg,
      o2TankKg: lsResult.o2TankKg,
      co2Kg: lsResult.co2Kg,
      counters: lsResult.counters,
    };

    // Check catastrophic loss
    if (!lsResult.survived) {
      survived = false;
      failureCause = lsResult.failureCause;
      failureHour = t;
      logs.push({
        t,
        type: 'failure',
        detail: `Mission lost: critical deficit threshold breached for ${failureCause}`,
      });
      break;
    }

    // 7. Food consumption and greenhouse yield
    const foodResult = stepFood(
      foodKcal,
      design.greenhouseModules,
      isGreenhousePowered,
      ruleResult.ghLow,
      lastGhLaborFraction,
      params,
    );
    foodKcal = foodResult.nextFoodKcal;
    foodDeficitActive = foodResult.foodDeficit;

    // 8. Crew time allocation
    const isConstructionPowered = powerResult.poweredLoads.has('construction');
    const isSciencePowered = powerResult.poweredLoads.has('science');

    const crewResult = allocateCrewTime(
      design,
      eventsState.activeRepairs,
      shieldBuilt,
      shieldProgressH,
      scienceHours,
      isGreenhousePowered,
      isConstructionPowered,
      isSciencePowered,
      ruleResult.shelter,
      ruleResult.pauseScience,
      params,
    );

    shieldBuilt = crewResult.updatedShieldBuilt;
    shieldProgressH = crewResult.updatedShieldProgressH;
    scienceHours = crewResult.updatedScienceHours;
    eventsState.activeRepairs = crewResult.remainingRepairs;
    lastGhLaborFraction = crewResult.ghLaborFraction;

    if (crewResult.layerCompletedThisTick) {
      logs.push({
        t,
        type: 'shield_layer_built',
        detail: `Regolith shielding layer ${shieldBuilt} completed`,
      });
    }

    for (let i = 0; i < crewResult.repairedThisTick.length; i++) {
      const repairedComp = crewResult.repairedThisTick[i];
      if (repairedComp) {
        eventsState.componentsOk[repairedComp] = true;
        logs.push({
          t,
          type: 'component_repaired',
          detail: `Component restored: ${repairedComp}`,
        });
      }
    }

    // 9. Radiation exposure accumulation
    const radResult = stepRadiation(
      doseUsv,
      shieldBuilt,
      ruleResult.shelter,
      eventsResult.isSpeActive,
      params,
    );
    doseUsv = radResult.nextDoseUsv;
    doseLimitExceeded = radResult.doseOverLimit;

    // 10. Metric tracking and state capture for next tick
    const batteryPct = batteryCapacityKwh > 0 ? (batteryKwh / batteryCapacityKwh) * 100 : 0;
    minBatteryPct = Math.min(minBatteryPct, batteryPct);

    const o2Days = dailyO2Demand > 0 ? lifeSupportState.o2TankKg / dailyO2Demand : 0;
    minO2Days = Math.min(minO2Days, o2Days);

    peakDoseUsv = Math.max(peakDoseUsv, doseUsv);

    prevRuleState = {
      batteryKwh,
      batteryCapacityKwh,
      o2TankKg: lifeSupportState.o2TankKg,
      isSpeWarningActive: eventsResult.isSpeWarningActive,
      componentsOk: { ...eventsState.componentsOk },
      darkWindows,
    };
  }

  const scienceTarget = params.getNumber('science.target_hours');
  const scienceMet = survived && scienceHours >= scienceTarget;

  return {
    seed,
    survived,
    failureCause,
    failureHour,
    scienceMet,
    minBatteryPct,
    minO2Days,
    peakDoseUsv,
    log: logs,
  };
}
