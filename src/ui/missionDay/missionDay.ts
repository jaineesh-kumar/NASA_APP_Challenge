// Mission Day (ADR-016): the player gives one order each morning and the engine runs that day.
// Every day re-runs the whole seeded mission with the orders so far (runMission is fast and
// deterministic), then reads the trace and log up to the end of the latest day. Orders map onto
// rule flags the engine already has, so each one has a real cost inside the same model.

import { missionPresets } from '../../content/missions.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { getDonkiArchive, loadParams } from '../../engine/params.ts';
import { runMission } from '../../engine/sim.ts';
import {
  DayOrder,
  Design,
  EngineError,
  LogEntry,
  LogType,
  MissionResult,
  Rules,
  StormMode,
} from '../../engine/types.ts';

const params = loadParams();
export const k = getSimConstants(params);
export const MISSION_DAYS = k.missionHours / 24;
export const MOON_DELAY_S = params.getNumber('comms.moon_one_way_delay_s');

/** Menu order: the busiest day first, the safest-but-idle day last. */
export const DAY_ORDERS: readonly DayOrder[] = [
  'full_speed',
  'save_power',
  'greenhouse_low',
  'radio_off',
  'fix_first',
  'shelter',
];

export interface DaySetup {
  round: number;
  seed: number;
  design: Design;
  /** The ladder only: no automatic IF-THEN rules, so the player's order is the only plan. */
  rules: Rules;
  stormMode: StormMode;
}

/**
 * Each new mission uses the next seed and the next real archived storm (replayability). The Light
 * kit has no shield and few spares, so careless orders can lose the crew: with the Balanced kit,
 * "full speed" every day always survived, so no order had a real cost (measured, ADR-016).
 */
export function daySetup(round: number): DaySetup {
  const kit = missionPresets.find((p) => p.id === 'light');
  if (!kit) throw new EngineError('NO_KIT', 'The light starter kit is missing.');
  const events = getDonkiArchive().events;
  const event = events.length > 0 ? events[round % events.length] : undefined;
  return {
    round,
    seed: round + 1,
    design: kit.design,
    rules: { priority: kit.rules.priority, ifThen: [] },
    stormMode: event ? { kind: 'replay', eventId: event.id } : { kind: 'random' },
  };
}

export function simulate(setup: DaySetup, orders: readonly DayOrder[]): MissionResult {
  return runMission(setup.design, setup.rules, setup.seed, params, {
    trace: true,
    stormMode: setup.stormMode,
    dayOrders: orders,
  });
}

/** Log entries worth telling a child about, in the day they happened. */
const NEWS_TYPES: ReadonlySet<LogType> = new Set<LogType>([
  'dark_window_start',
  'dark_window_end',
  'dust_start',
  'spe_warning',
  'spe_start',
  'spe_end',
  'warning_missed',
  'component_failed',
  'component_repaired',
  'battery_empty',
  'shield_layer_built',
  'failure',
]);

export interface DayView {
  /** Days already played (0 before the first order). */
  daysDone: number;
  /** Last hour shown on the meters. */
  hour: number;
  isLost: boolean;
  isFinished: boolean;
  news: LogEntry[];
  scienceHours: number;
  /** What the crew can know about tomorrow. */
  isDarkTomorrow: boolean;
  isStormWarningHeard: boolean;
}

export function dayView(result: MissionResult, daysDone: number): DayView {
  const trace = result.trace;
  if (!trace) throw new EngineError('NO_TRACE', 'Mission Day needs the hourly trace.');
  const lastHour = trace.batteryPct.length - 1;
  const endHour = Math.min(daysDone * 24, k.missionHours) - 1;
  const isLost = result.failureHour !== null && result.failureHour <= Math.max(endHour, 0);
  const hour = Math.max(0, Math.min(isLost ? (result.failureHour ?? 0) : endHour, lastHour));
  const dayStart = (daysDone - 1) * 24;
  const news =
    daysDone === 0
      ? []
      : result.log.filter((e) => e.t >= dayStart && e.t <= hour && NEWS_TYPES.has(e.type));

  // Dark windows follow the Sun and the hills, so they are known in advance.
  const tomorrow = trace.isDark.slice(endHour + 1, endHour + 1 + 24);
  const isDarkTomorrow = !isLost && tomorrow.some((d) => d);
  // A warning only counts if the radio heard it (B5.10) and that storm is not over yet.
  const heard = result.log.filter((e) => e.t <= hour && e.type === 'spe_warning').pop();
  const ended = result.log.filter((e) => e.t <= hour && e.type === 'spe_end').pop();
  const isStormWarningHeard = !!heard && (!ended || ended.t < heard.t);

  return {
    daysDone,
    hour,
    isLost,
    isFinished: !isLost && daysDone >= MISSION_DAYS,
    news,
    scienceHours: trace.scienceHours[hour] ?? 0,
    isDarkTomorrow,
    isStormWarningHeard,
  };
}
