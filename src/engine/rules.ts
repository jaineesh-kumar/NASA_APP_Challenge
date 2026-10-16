// IF-THEN rules evaluator and condition matching
// Spec B5.2, B5.4 (Step 2)

import { LoadedParams } from './params.ts';
import { DarkWindow } from './schedule.ts';
import { Condition, IfThenRule, LoadId, LogEntry, Rules } from './types.ts';

export interface RuleEvaluationState {
  batteryKwh: number;
  batteryCapacityKwh: number;
  o2TankKg: number;
  isSpeWarningActive: boolean;
  componentsOk: Record<string, boolean>;
  darkWindows: readonly DarkWindow[];
}

export interface RuleEvaluationResult {
  forcedOff: Set<LoadId>;
  shelter: boolean;
  repairFirst: boolean;
  ghLow: boolean;
  pauseScience: boolean;
  logs: LogEntry[];
}

/**
 * Checks whether a single rule condition is met based on the state at the end of the previous tick.
 */
export function checkCondition(
  condition: Condition,
  state: RuleEvaluationState,
  t: number,
  params: LoadedParams,
): boolean {
  switch (condition.kind) {
    case 'battery_below_pct': {
      if (state.batteryCapacityKwh <= 0) return true;
      const pct = (state.batteryKwh / state.batteryCapacityKwh) * 100;
      return pct < condition.value;
    }
    case 'spe_warning': {
      return state.isSpeWarningActive;
    }
    case 'o2_days_below': {
      const crewSize = params.getNumber('crew.size');
      const o2KgPerDay = params.getNumber('crew.o2_kg_per_day');
      const dailyConsumption = crewSize * o2KgPerDay;
      const o2Days = dailyConsumption > 0 ? state.o2TankKg / dailyConsumption : 0;
      return o2Days < condition.value;
    }
    case 'dark_window_within_h': {
      // Check if any dark window starts within condition.value hours from now
      for (let i = 0; i < state.darkWindows.length; i++) {
        const w = state.darkWindows[i];
        if (w) {
          const hoursUntilStart = w.start - t;
          if (hoursUntilStart > 0 && hoursUntilStart <= condition.value) {
            return true;
          }
        }
      }
      return false;
    }
    case 'component_failed': {
      for (const compId of Object.keys(state.componentsOk)) {
        if (!state.componentsOk[compId]) {
          return true;
        }
      }
      return false;
    }
  }
}

/**
 * Evaluates rules.ifThen in order.
 * Spec B5.4 Step 2:
 * Evaluated against previous tick state. Re-evaluated every tick (no latching).
 */
export function evaluateRules(
  rules: Rules,
  state: RuleEvaluationState,
  t: number,
  params: LoadedParams,
): RuleEvaluationResult {
  const forcedOff = new Set<LoadId>();
  let shelter = false;
  let repairFirst = false;
  let ghLow = false;
  let pauseScience = false;
  const logs: LogEntry[] = [];

  for (let i = 0; i < rules.ifThen.length; i++) {
    const rule: IfThenRule | undefined = rules.ifThen[i];
    if (!rule) continue;

    if (checkCondition(rule.condition, state, t, params)) {
      logs.push({
        t,
        type: 'rule_fired',
        detail: `Rule fired: ${rule.condition.kind} -> ${rule.action.kind}`,
      });

      switch (rule.action.kind) {
        case 'shed':
          forcedOff.add(rule.action.load);
          break;
        case 'shelter':
          shelter = true;
          break;
        case 'repair_first':
          repairFirst = true;
          break;
        case 'greenhouse_low_power':
          ghLow = true;
          break;
        case 'pause_science':
          pauseScience = true;
          break;
      }
    }
  }

  return {
    forcedOff,
    shelter,
    repairFirst,
    ghLow,
    pauseScience,
    logs,
  };
}
