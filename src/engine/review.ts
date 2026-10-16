// Cause chain construction and educational concept hints
// Spec B5.9

import { FailureCause, LogEntry, MissionResult } from './types.ts';

export interface CauseChainLink {
  effect: string;
  causes: string[];
}

export interface CauseChainResult {
  chain: CauseChainLink[];
  conceptHint: string;
}

/**
 * Builds a causal chain from the log of a failed mission run.
 * Spec B5.9:
 * Walks back through at most 5 linked log entries in priority order. Never invents links.
 * Maps concept hint by primary failure root cause.
 */
export function buildCauseChain(input: LogEntry[] | MissionResult): CauseChainResult {
  let logs: LogEntry[];
  let failureCause: FailureCause | null = null;

  if (Array.isArray(input)) {
    logs = input;
    const failEntry = logs.find((l) => l.type === 'failure');
    if (failEntry) {
      if (failEntry.detail.includes('oxygen')) failureCause = 'oxygen';
      else if (failEntry.detail.includes('co2')) failureCause = 'co2';
      else if (failEntry.detail.includes('water')) failureCause = 'water';
      else if (failEntry.detail.includes('food')) failureCause = 'food';
      else if (failEntry.detail.includes('dose')) failureCause = 'dose';
    }
  } else {
    logs = input.log;
    failureCause = input.failureCause;
  }

  if (!failureCause) {
    return {
      chain: [],
      conceptHint: 'All mission criteria survived; maintain margins for resilience.',
    };
  }

  const chain: CauseChainLink[] = [];
  const foundEffects: string[] = [];

  // Walk backwards from failure event
  const reversed = [...logs].reverse();

  for (let i = 0; i < reversed.length && foundEffects.length < 5; i++) {
    const entry = reversed[i];
    if (!entry) continue;

    if (entry.type === 'failure') {
      foundEffects.push(`Fatal loss: ${failureCause}`);
    } else if (entry.type === 'load_off' && entry.detail.includes('life_support')) {
      if (!foundEffects.includes('Life support load shed')) {
        foundEffects.push('Life support load shed');
      }
    } else if (entry.type === 'battery_empty') {
      if (!foundEffects.includes('Main battery fully exhausted')) {
        foundEffects.push('Main battery fully exhausted');
      }
    } else if (entry.type === 'component_failed') {
      const desc = `Component failure: ${entry.detail}`;
      if (!foundEffects.includes(desc)) {
        foundEffects.push(desc);
      }
    } else if (entry.type === 'dark_window_start') {
      if (!foundEffects.includes('Outpost entered dark window')) {
        foundEffects.push('Outpost entered dark window');
      }
    } else if (entry.type === 'dust_start') {
      if (!foundEffects.includes('Dust storm obscured solar arrays')) {
        foundEffects.push('Dust storm obscured solar arrays');
      }
    } else if (entry.type === 'spe_start') {
      if (!foundEffects.includes('Solar Particle Event radiation storm')) {
        foundEffects.push('Solar Particle Event radiation storm');
      }
    }
  }

  // Build sequential causal links from reversed walk
  for (let i = 0; i < foundEffects.length - 1; i++) {
    const effect = foundEffects[i];
    const cause = foundEffects[i + 1];
    if (effect && cause) {
      chain.push({
        effect,
        causes: [cause],
      });
    }
  }

  // Map concept hint per Spec B5.9 table
  let conceptHint = 'Margin: Maintain adequate reserves across power and life support subsystems.';
  const hasBatteryExhaustion = foundEffects.some((e) => e.includes('battery'));

  if (hasBatteryExhaustion) {
    conceptHint =
      'Margin: Expand battery capacity or mast illumination height to bridge surface dark windows and dust storms.';
  } else if (failureCause === 'water') {
    conceptHint =
      'Loop closure: Upgrade water recovery loops to reduce daily expendable fluid replenishment.';
  } else if (failureCause === 'oxygen' || failureCause === 'co2') {
    conceptHint =
      'Redundancy: Carry component spares or install backup loops to avoid single-point failure.';
  } else if (failureCause === 'dose') {
    conceptHint =
      'Trade-off: Invest launch mass in shielding layers and activate storm shelter during solar particle events.';
  } else if (failureCause === 'food') {
    conceptHint =
      'Resilience: Install greenhouse capacity to offset finite rations and ensure caloric stability.';
  }

  return {
    chain,
    conceptHint,
  };
}
