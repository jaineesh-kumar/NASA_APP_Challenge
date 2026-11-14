// Priority ladder validation and IF-THEN rule interpreter
// Spec B5.2, B5.4 step 2

import { LOAD_IDS } from './constants.ts';
import { Condition, EngineError, LoadId, Rules } from './types.ts';

export const MAX_RULES = 5;

/** State at the end of the previous tick (rules never see the current tick). */
export interface RuleState {
  batteryPct: number;
  o2Days: number;
  /** Radiation alert: a storm warning heard over comms, or a storm detected at the base. */
  isRadiationAlert: boolean;
  hoursToNextDark: number;
  isAnyComponentFailed: boolean;
}

export interface RuleFlags {
  forcedOff: Set<LoadId>;
  shelter: boolean;
  repairFirst: boolean;
  ghLow: boolean;
  pauseScience: boolean;
  /** Index of each rule that fired this tick. */
  fired: boolean[];
}

export function validateRules(rules: Rules): void {
  if (rules.ifThen.length > MAX_RULES) {
    throw new EngineError('TOO_MANY_RULES', `At most ${MAX_RULES} IF-THEN rules are allowed.`);
  }
  const seen = new Set(rules.priority);
  if (rules.priority.length !== LOAD_IDS.length || seen.size !== LOAD_IDS.length) {
    throw new EngineError('INVALID_PRIORITY', 'Priority must list each of the 6 loads once.');
  }
  for (const id of LOAD_IDS) {
    if (!seen.has(id)) throw new EngineError('INVALID_PRIORITY', `Priority is missing '${id}'.`);
  }
}

export function checkCondition(c: Condition, s: RuleState): boolean {
  switch (c.kind) {
    case 'battery_below_pct':
      return s.batteryPct < c.value;
    case 'spe_warning':
      return s.isRadiationAlert;
    case 'o2_days_below':
      return s.o2Days < c.value;
    case 'dark_window_within_h':
      return s.hoursToNextDark <= c.value;
    case 'component_failed':
      return s.isAnyComponentFailed;
  }
}

/** Spec B5.4 step 2: evaluated in order every tick, no latching. */
const NO_RULES_FIRED: boolean[] = [];

export function evaluateRules(rules: Rules, s: RuleState): RuleFlags {
  if (rules.ifThen.length === 0) {
    return {
      forcedOff: new Set<LoadId>(),
      shelter: false,
      repairFirst: false,
      ghLow: false,
      pauseScience: false,
      fired: NO_RULES_FIRED,
    };
  }
  const flags: RuleFlags = {
    forcedOff: new Set<LoadId>(),
    shelter: false,
    repairFirst: false,
    ghLow: false,
    pauseScience: false,
    fired: [],
  };
  for (const rule of rules.ifThen) {
    const hit = checkCondition(rule.condition, s);
    flags.fired.push(hit);
    if (!hit) continue;
    const a = rule.action;
    switch (a.kind) {
      case 'shed':
        flags.forcedOff.add(a.load);
        break;
      case 'shelter':
        flags.shelter = true;
        break;
      case 'repair_first':
        flags.repairFirst = true;
        break;
      case 'greenhouse_low_power':
        flags.ghLow = true;
        break;
      case 'pause_science':
        flags.pauseScience = true;
        break;
    }
  }
  return flags;
}

export function describeRule(rules: Rules, index: number): string {
  const r = rules.ifThen[index];
  if (!r) return '';
  const cond =
    'value' in r.condition ? `${r.condition.kind} ${r.condition.value}` : r.condition.kind;
  const act = r.action.kind === 'shed' ? `shed ${r.action.load}` : r.action.kind;
  // Action first so the cause chain can match e.g. "shed life_support" (Spec B5.9).
  return `${act} when ${cond}`;
}
