// One seeded 30-day mission: runMission(design, rules, seed)
// Spec B5.4 (order of operations), B5.5, B5.6; ADR-005 (real storms), ADR-006 (comms warnings)

import { LOAD_IDS, getSimConstants } from './constants.ts';
import { allocateCrewTime } from './crew.ts';
import { buildStormMask, createInitialEventsState, stepEvents } from './events.ts';
import { stepFood } from './food.ts';
import { createInitialLifeSupportState, stepLifeSupport } from './lifeSupport.ts';
import { LoadedParams, loadParams } from './params.ts';
import { allocatePower, computeDemands, computeGeneration, updateBattery } from './power.ts';
import { hourlyDoseUsv } from './radiation.ts';
import { mulberry32 } from './rng.ts';
import { describeRule, evaluateRules, RuleState, validateRules } from './rules.ts';
import { buildDarkMask, computeDarkWindows, hoursUntilNextDark } from './schedule.ts';
import { getSpaceWeather, pickSunWindow, SpaceWeatherRecord } from './spaceWeather.ts';
import {
  Design,
  FailureCause,
  LoadId,
  LogEntry,
  LogType,
  MissionOptions,
  MissionResult,
  MissionTrace,
  Rules,
  StormInfo,
} from './types.ts';

function emptyTrace(): MissionTrace {
  return {
    batteryPct: [],
    o2Days: [],
    waterKg: [],
    foodDays: [],
    co2Kg: [],
    doseUsv: [],
    isDark: [],
    isStorm: [],
    isSheltering: [],
    isCommsOn: [],
  };
}

export function runMission(
  design: Design,
  rules: Rules,
  seed: number,
  paramsInput?: LoadedParams,
  options: MissionOptions = {},
  spaceWeather: SpaceWeatherRecord = getSpaceWeather(),
): MissionResult {
  validateRules(rules);
  const k = getSimConstants(paramsInput ?? loadParams());
  const H = k.missionHours;
  const rng = mulberry32(seed);

  // Before tick 0 (B5.3 + ADR-005): one jitter draw per dark window, then one sun-window draw.
  const darkWindows = computeDarkWindows(design.site, design.mastLevel, k, rng);
  const darkMask = buildDarkMask(darkWindows, H);
  const sunWindow = pickSunWindow(spaceWeather, options.sunEra ?? 'all', H, rng());
  const storms = sunWindow.storms;
  const stormMask = buildStormMask(storms, k);
  const stormInfo: StormInfo[] = storms.map((s) => ({
    onsetH: s.onsetH,
    leadH: s.leadH,
    warningReceivedH: null,
    wasSheltered: false,
    id: s.id,
    link: s.link,
  }));

  // Step 0: initial state
  const capacityKwh = design.batteries * k.batteryKwhPerUnit;
  let batteryKwh = capacityKwh;
  let ls = createInitialLifeSupportState(design, k);
  let ev = createInitialEventsState(design);
  let foodKcal = k.startFoodKcal;
  let doseUsv = 0;
  let shieldBuilt = 0;
  let shieldProgressH = 0;
  let scienceHours = 0;
  let o2DeficitH = 0;
  let co2OverH = 0;
  let waterZeroH = 0;
  let foodShortH = 0;

  let minBatteryPct = 100;
  let minO2Days = Infinity;
  let peakDoseUsv = 0;

  const log: LogEntry[] = [];
  const add = (t: number, type: LogType, detail: string) => log.push({ t, type, detail });
  const trace = options.trace ? emptyTrace() : undefined;

  let survived = true;
  let failureCause: FailureCause | null = null;
  let failureHour: number | null = null;

  // Previous-tick state for rules and for logging changes only (never per-tick spam).
  let prev: RuleState = {
    batteryPct: 100,
    o2Days: ls.o2TankKg / k.o2KgPerDayCrew,
    isRadiationAlert: false,
    hoursToNextDark: Infinity,
    isAnyComponentFailed: false,
  };
  let wasDark = false;
  let wasBatteryEmpty = false;
  let prevFired: boolean[] = [];
  const wasStarved: Record<LoadId, boolean> = {
    life_support: false,
    thermal: false,
    comms: false,
    greenhouse: false,
    science: false,
    construction: false,
  };
  // Hour after which no received warning is still relevant (alert lasts to storm end).
  let alertUntilH = -1;

  for (let t = 0; t < H; t++) {
    // 1. Events
    const isDark = darkMask[t] === 1;
    if (isDark !== wasDark) add(t, isDark ? 'dark_window_start' : 'dark_window_end', '');
    wasDark = isDark;

    const evStep = stepEvents(ev, rng, k);
    ev = evStep.state;
    if (evStep.isDustStarted) add(t, 'dust_start', '');
    for (const id of evStep.failed) {
      add(
        t,
        'component_failed',
        `${id}${Number.isFinite(ev.repairsLeftH[id] ?? 0) ? '' : ' no_spare'}`,
      );
    }
    const isStorm = stormMask[t] === 1;
    if (!isStorm && t > 0 && stormMask[t - 1] === 1) add(t, 'spe_end', '');

    // 2. Rules (state at the end of the previous tick)
    prev.hoursToNextDark = hoursUntilNextDark(t, darkWindows);
    const flags = evaluateRules(rules, prev);
    for (let i = 0; i < flags.fired.length; i++) {
      if (flags.fired[i] && !prevFired[i]) add(t, 'rule_fired', describeRule(rules, i));
    }
    prevFired = flags.fired;
    const isSheltering = flags.shelter;

    // 3. Generation
    const genKw = computeGeneration(
      design.panels,
      isDark,
      ev.dustLeftH > 0,
      !ev.isOk.power_array,
      k,
    );

    // 4. Allocation and battery
    const demands = computeDemands(
      design,
      {
        inDarkWindow: isDark,
        ghLow: flags.ghLow,
        pauseScience: flags.pauseScience,
        isSheltering,
        allShieldsBuilt: shieldBuilt >= design.shieldingLayers,
        forcedOff: flags.forcedOff,
      },
      k,
    );
    const alloc = allocatePower(genKw + batteryKwh, rules.priority, demands, flags.forcedOff);
    batteryKwh = updateBattery(batteryKwh, capacityKwh, genKw, alloc.suppliedKw, k);
    const isBatteryEmpty = batteryKwh <= 1e-9;
    if (isBatteryEmpty && !wasBatteryEmpty) add(t, 'battery_empty', '');
    wasBatteryEmpty = isBatteryEmpty;
    for (const load of LOAD_IDS) {
      const starved = alloc.starved[load];
      if (starved && !wasStarved[load]) add(t, 'load_off', load);
      wasStarved[load] = starved;
    }
    const powered = alloc.powered;

    // 5. Life support
    const lsStep = stepLifeSupport(
      ls,
      design,
      {
        isPowered: powered.life_support,
        isO2GeneratorOk: ev.isOk.o2_generator,
        isWaterProcessorOk: ev.isOk.water_processor,
        isCo2ScrubberOk: ev.isOk.co2_scrubber,
      },
      k,
    );
    ls = { waterKg: lsStep.waterKg, o2TankKg: lsStep.o2TankKg, co2Kg: lsStep.co2Kg };

    // 6. Crew hours
    const crew = allocateCrewTime(
      design,
      {
        isSheltering,
        repairFirst: flags.repairFirst,
        pauseScience: flags.pauseScience,
        isGreenhousePowered: powered.greenhouse,
        isSciencePowered: powered.science && demands.science > 0,
        isConstructionPowered: powered.construction && demands.construction > 0,
        shieldBuilt,
        shieldProgressH,
        repairsLeftH: ev.repairsLeftH,
      },
      k,
    );
    scienceHours += crew.hours.science;
    shieldBuilt = crew.shieldBuilt;
    shieldProgressH = crew.shieldProgressH;
    if (crew.isLayerCompleted) add(t, 'shield_layer_built', String(shieldBuilt));
    if (crew.repaired.length > 0) {
      const isOk = { ...ev.isOk };
      for (const id of crew.repaired) {
        isOk[id] = true;
        add(t, 'component_repaired', id);
      }
      ev = { ...ev, isOk, repairsLeftH: crew.repairsLeftH };
    } else if (crew.repairsLeftH !== ev.repairsLeftH) {
      ev = { ...ev, repairsLeftH: crew.repairsLeftH };
    }

    // 7. Food
    const food = stepFood(
      foodKcal,
      {
        modules: design.greenhouseModules,
        isGreenhousePowered: powered.greenhouse,
        ghLow: flags.ghLow,
        allocatedH: crew.hours.greenhouse,
        neededH: crew.greenhouseNeedH,
        waterKg: ls.waterKg,
      },
      k,
    );
    foodKcal = food.foodKcal;
    if (food.ghWaterKg > 0) ls = { ...ls, waterKg: Math.max(0, ls.waterKg - food.ghWaterKg) };

    // 8. Radiation
    doseUsv += hourlyDoseUsv(shieldBuilt, isSheltering, isStorm, k);

    // Storm warnings travel from Earth forecasters over the comms link (ADR-006).
    const isCommsOn = powered.comms;
    for (let i = 0; i < storms.length; i++) {
      const s = storms[i];
      const info = stormInfo[i];
      if (!s || !info) continue;
      if (s.onsetH === t) {
        info.wasSheltered = isSheltering;
        if (s.leadH > 0 && info.warningReceivedH === null) add(t, 'warning_missed', s.id);
        add(t, 'spe_start', isSheltering ? 'sheltered' : 'unsheltered');
      }
      if (s.leadH > 0 && info.warningReceivedH === null && t >= s.warnH && t < s.onsetH) {
        if (isCommsOn) {
          info.warningReceivedH = t;
          alertUntilH = Math.max(alertUntilH, s.onsetH + k.speDurationH);
          add(t, 'spe_warning', String(s.onsetH - t));
        }
      }
    }

    // 9. Checks, metrics, log
    o2DeficitH = lsStep.isO2Deficit ? o2DeficitH + 1 : 0;
    co2OverH = lsStep.isCo2OverLimit ? co2OverH + 1 : 0;
    waterZeroH = ls.waterKg <= 0 ? waterZeroH + 1 : 0;
    foodShortH = food.isShortfall ? foodShortH + 1 : 0;

    const batteryPct = capacityKwh > 0 ? (batteryKwh / capacityKwh) * 100 : 0;
    const o2Days = ls.o2TankKg / k.o2KgPerDayCrew;
    minBatteryPct = Math.min(minBatteryPct, batteryPct);
    minO2Days = Math.min(minO2Days, o2Days);
    peakDoseUsv = Math.max(peakDoseUsv, doseUsv);

    if (trace) {
      trace.batteryPct.push(batteryPct);
      trace.o2Days.push(o2Days);
      trace.waterKg.push(ls.waterKg);
      trace.foodDays.push(foodKcal / k.foodKcalPerDayCrew);
      trace.co2Kg.push(ls.co2Kg);
      trace.doseUsv.push(doseUsv);
      trace.isDark.push(isDark);
      trace.isStorm.push(isStorm);
      trace.isSheltering.push(isSheltering);
      trace.isCommsOn.push(isCommsOn);
    }

    // Spec B5.6: first condition hit ends the mission.
    if (o2DeficitH >= k.lossO2Hours) failureCause = 'oxygen';
    else if (co2OverH >= k.lossCo2Hours) failureCause = 'co2';
    else if (waterZeroH >= k.lossWaterHours) failureCause = 'water';
    else if (foodShortH >= k.lossFoodHours) failureCause = 'food';
    else if (doseUsv > k.doseLimitUsv) failureCause = 'dose';
    if (failureCause) {
      survived = false;
      failureHour = t;
      add(t, 'failure', failureCause);
      break;
    }

    prev = {
      batteryPct,
      o2Days,
      // Alert = storm detected at the base, or a warning heard over comms for a storm not over yet.
      isRadiationAlert: isStorm || t < alertUntilH,
      hoursToNextDark: Infinity,
      isAnyComponentFailed: !(
        ev.isOk.co2_scrubber &&
        ev.isOk.o2_generator &&
        ev.isOk.water_processor &&
        ev.isOk.power_array
      ),
    };
  }

  return {
    seed,
    survived,
    failureCause,
    failureHour,
    scienceMet: scienceHours >= k.scienceTargetHours,
    minBatteryPct,
    minO2Days: Number.isFinite(minO2Days) ? minO2Days : prev.o2Days,
    peakDoseUsv,
    log,
    sun: { startDate: sunWindow.startDate, storms: stormInfo },
    scienceHours,
    ...(trace ? { trace } : {}),
  };
}
