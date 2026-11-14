// One seeded 30-day mission: runMission(design, rules, seed)
// Spec B5.4 (order of operations), B5.5, B5.6, B5.10 (comms link), B5.11 (Real Storm Replay)

import { LOAD_IDS, getSimConstants, SimConstants } from './constants.ts';
import { allocateCrewTime } from './crew.ts';
import { createInitialEventsState, ScheduledSpe, stepEvents } from './events.ts';
import { stepFood } from './food.ts';
import { createInitialLifeSupportState, stepLifeSupport } from './lifeSupport.ts';
import { flareClassIndex, getDonkiArchive, LoadedParams, loadParams } from './params.ts';
import { allocatePower, computeDemands, computeGeneration, updateBattery } from './power.ts';
import { hourlyDoseUsv } from './radiation.ts';
import { mulberry32 } from './rng.ts';
import { describeRule, evaluateRules, RuleState, validateRules } from './rules.ts';
import { buildDarkMask, computeDarkWindows, hoursUntilNextDark } from './schedule.ts';
import {
  Design,
  EngineError,
  FailureCause,
  LoadId,
  LogEntry,
  LogType,
  MissionOptions,
  MissionResult,
  MissionTrace,
  Rules,
  StormInfo,
  StormMode,
} from './types.ts';

/**
 * Spec B5.11: in replay mode exactly one SPE arrives at radiation.replay_onset_h with the game
 * strength for the archived event's linked flare class. The warning starts
 * radiation.spe_warning_lead_h earlier, the same lead random events get (ADR-010).
 */
export function replaySpe(mode: StormMode, k: SimConstants): ScheduledSpe | null {
  if (mode.kind === 'random') return null;
  const event = getDonkiArchive().events.find((e) => e.id === mode.eventId);
  if (!event) throw new EngineError('UNKNOWN_STORM', `No archived storm with id ${mode.eventId}.`);
  const multiplier = k.speMultiplierByFlareClass[flareClassIndex(event.flareClass)];
  if (multiplier === undefined) {
    throw new EngineError(
      'UNKNOWN_FLARE_CLASS',
      `No game strength for flare class ${event.flareClass}.`,
    );
  }
  if (k.replayOnsetH < 0 || k.replayOnsetH >= k.missionHours) {
    throw new EngineError(
      'INVALID_REPLAY_ONSET',
      'radiation.replay_onset_h must be inside the mission.',
    );
  }
  return {
    warnH: Math.max(0, k.replayOnsetH - k.speWarningLeadH),
    onsetH: k.replayOnsetH,
    endH: k.replayOnsetH + k.speDurationH,
    multiplier,
  };
}

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
): MissionResult {
  validateRules(rules);
  const k = getSimConstants(paramsInput ?? loadParams());
  const H = k.missionHours;
  const rng = mulberry32(seed);

  // Spec B5.3: dark-window jitter is drawn once before tick 0, one draw per window.
  const darkWindows = computeDarkWindows(design.site, design.mastLevel, k, rng);
  const darkMask = buildDarkMask(darkWindows, H);
  const storms: StormInfo[] = [];
  // Spec B5.10: the base starts the mission with its radio link up.
  let groundLinkUp = true;
  let isSpeWarned = false;
  const stormMode: StormMode = options.stormMode ?? { kind: 'random' };
  const isRandomStorms = stormMode.kind === 'random';

  // Step 0: initial state
  const capacityKwh = design.batteries * k.batteryKwhPerUnit;
  let batteryKwh = capacityKwh;
  let ls = createInitialLifeSupportState(design, k);
  let ev = createInitialEventsState(design, replaySpe(stormMode, k));
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

  for (let t = 0; t < H; t++) {
    // 1. Events
    const isDark = darkMask[t] === 1;
    if (isDark !== wasDark) add(t, isDark ? 'dark_window_start' : 'dark_window_end', '');
    wasDark = isDark;

    // Spec B5.10: repair help needs the link that was up at the end of the previous tick.
    const repairFactor = groundLinkUp ? 1 - k.commsRepairAssistFraction : 1;
    const evStep = stepEvents(ev, t, rng, k, isRandomStorms, repairFactor);
    ev = evStep.state;
    if (evStep.isSpeEnded) add(t, 'spe_end', '');
    if (evStep.isSpeWarningStarted) isSpeWarned = false; // a new event: nothing heard yet
    if (evStep.isDustStarted) add(t, 'dust_start', '');
    for (const id of evStep.failed) {
      add(
        t,
        'component_failed',
        `${id}${Number.isFinite(ev.repairsLeftH[id] ?? 0) ? '' : ' no_spare'}`,
      );
    }
    const isStorm = evStep.speMultiplier !== 1;

    // 2. Rules (state at the end of the previous tick)
    prev.hoursToNextDark = hoursUntilNextDark(t, darkWindows);
    const flags = evaluateRules(rules, prev);
    for (let i = 0; i < flags.fired.length; i++) {
      if (flags.fired[i] && !prevFired[i]) add(t, 'rule_fired', describeRule(rules, i));
    }
    prevFired = flags.fired;
    const isSheltering = flags.shelter;
    if (evStep.isSpeStarted) {
      storms.push({ onsetH: t, wasSheltered: isSheltering });
      if (!isSpeWarned) add(t, 'warning_missed', 'comms_off');
      add(t, 'spe_start', isSheltering ? 'sheltered' : 'unsheltered');
    }

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
    // Spec B5.10: groundLinkUp for tick t is whether comms is powered in step 4 of tick t.
    groundLinkUp = powered.comms;
    if (ev.spe && evStep.isSpeWarning && groundLinkUp && !isSpeWarned) {
      isSpeWarned = true;
      add(t, 'spe_warning', String(Math.max(0, ev.spe.onsetH - t)));
    }

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
    doseUsv += hourlyDoseUsv(shieldBuilt, isSheltering, evStep.speMultiplier, k);
    const isCommsOn = powered.comms;

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
      // Spec B5.10: speWarning = (an SPE is pending or active) AND groundLinkUp.
      isRadiationAlert: evStep.isSpeWarning && groundLinkUp,
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
    storms,
    scienceHours,
    ...(trace ? { trace } : {}),
  };
}
