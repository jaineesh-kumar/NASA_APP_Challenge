// Cause chain and concept hint from a mission log
// Spec B5.9 (table extended for the B5.10 comms link, ADR-012)

import { FailureCause, LogEntry, MissionResult } from './types.ts';

export type ConceptId =
  | 'redundancy'
  | 'single_point_of_failure'
  | 'margin'
  | 'loop_closure'
  | 'trade_offs'
  | 'communication';

/** One link: `effect` happened because of `cause`. Both are real log entries. */
export interface CauseChainLink {
  effect: LogEntry;
  cause: LogEntry;
}

export interface CauseChainResult {
  failure: LogEntry | null;
  chain: CauseChainLink[];
  concept: ConceptId | null;
}

type Pattern = (e: LogEntry) => boolean;

const is =
  (type: LogEntry['type'], detailStart?: string): Pattern =>
  (e) =>
    e.type === type && (detailStart === undefined || e.detail.startsWith(detailStart));

/** Key of an entry for table lookup, e.g. "load_off:life_support". */
function keyOf(e: LogEntry): string {
  if (e.type === 'failure') return `failure:${e.detail}`;
  if (e.type === 'load_off') return `load_off:${e.detail}`;
  if (e.type === 'spe_start') return `spe_start:${e.detail}`;
  return e.type;
}

// Spec B5.9 (table extended for the B5.10 comms link, ADR-012) table, causes in priority order. "water at zero" and "too few shield layers" are
// not log events, so they are not linked (never invent a link).
const CAUSES: Readonly<Record<string, readonly Pattern[]>> = {
  'failure:oxygen': [is('component_failed', 'o2_generator'), is('load_off', 'life_support')],
  'failure:co2': [is('component_failed', 'co2_scrubber'), is('load_off', 'life_support')],
  'failure:water': [is('component_failed', 'water_processor'), is('load_off', 'life_support')],
  'failure:food': [is('load_off', 'greenhouse'), is('component_failed', 'water_processor')],
  'failure:dose': [is('spe_start', 'unsheltered'), is('spe_start')],
  'spe_start:unsheltered': [is('warning_missed')],
  warning_missed: [is('load_off', 'comms'), is('rule_fired', 'shed comms')],
  'load_off:comms': [is('battery_empty')],
  'load_off:life_support': [
    is('battery_empty'),
    is('rule_fired', 'shed life_support'),
    is('component_failed', 'power_array'),
  ],
  'load_off:greenhouse': [is('battery_empty'), is('component_failed', 'power_array')],
  battery_empty: [is('dark_window_start'), is('dust_start'), is('component_failed', 'power_array')],
};

const MAX_LINKS = 5;

export function buildCauseChain(input: MissionResult | readonly LogEntry[]): CauseChainResult {
  const log: readonly LogEntry[] = Array.isArray(input) ? input : (input as MissionResult).log;
  let failureIdx = -1;
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i]?.type === 'failure') {
      failureIdx = i;
      break;
    }
  }
  const failure = failureIdx >= 0 ? (log[failureIdx] ?? null) : null;
  if (!failure) return { failure: null, chain: [], concept: null };

  const chain: CauseChainLink[] = [];
  let effect = failure;
  let effectIdx = failureIdx;
  while (chain.length < MAX_LINKS) {
    const patterns = CAUSES[keyOf(effect)];
    if (!patterns) break;
    let found = -1;
    // Priority order first, then the most recent matching entry before the effect.
    for (const p of patterns) {
      for (let i = effectIdx - 1; i >= 0; i--) {
        const e = log[i];
        if (e && p(e)) {
          found = i;
          break;
        }
      }
      if (found >= 0) break;
    }
    const cause = found >= 0 ? log[found] : undefined;
    if (!cause) break;
    chain.push({ effect, cause });
    effect = cause;
    effectIdx = found;
  }

  return { failure, chain, concept: conceptFor(failure.detail as FailureCause, chain) };
}

// Spec B5.9 (table extended for the B5.10 comms link, ADR-012) concept hint by effect.
function conceptFor(cause: FailureCause, chain: readonly CauseChainLink[]): ConceptId {
  const types = new Set(chain.map((l) => l.cause.type));
  if (types.has('warning_missed')) return 'communication';
  if (types.has('battery_empty')) return 'margin';
  switch (cause) {
    case 'water':
      return 'loop_closure';
    case 'dose':
      return 'trade_offs';
    case 'food':
      return 'margin';
    case 'oxygen':
    case 'co2':
      return chain.some((l) => l.cause.type === 'component_failed')
        ? 'single_point_of_failure'
        : 'redundancy';
  }
}
