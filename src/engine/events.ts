// Seeded random events, component failures, and maintenance tracking
// Spec B5.3, B5.4 (Step 1), B5.5

import { LoadedParams } from './params.ts';
import { ComponentId, Design, LogEntry } from './types.ts';

export interface EventsState {
  dustRemainingH: number;
  speWarningLeadRemainingH: number; // countdown until SPE starts; 0 when not pending
  speActiveRemainingH: number; // countdown for active SPE; 0 when not active
  isSpeWarningActive: boolean;
  componentsOk: Record<ComponentId, boolean>;
  sparesRemaining: Record<ComponentId, number>;
  activeRepairs: Partial<Record<ComponentId, number>>;
}

export interface EventsStepResult {
  state: EventsState;
  logs: LogEntry[];
  isDustActive: boolean;
  isSpeActive: boolean;
  isSpeWarningActive: boolean;
}

export const COMPONENT_IDS: readonly ComponentId[] = [
  'co2_scrubber',
  'o2_generator',
  'water_processor',
  'power_array',
];

/**
 * Creates initial events and component state before tick 0.
 * Spec B5.4 Step 0.
 */
export function createInitialEventsState(design: Design): EventsState {
  return {
    dustRemainingH: 0,
    speWarningLeadRemainingH: 0,
    speActiveRemainingH: 0,
    isSpeWarningActive: false,
    componentsOk: {
      co2_scrubber: true,
      o2_generator: true,
      water_processor: true,
      power_array: true,
    },
    sparesRemaining: {
      co2_scrubber: design.spares.co2_scrubber,
      o2_generator: design.spares.o2_generator,
      water_processor: design.spares.water_processor,
      power_array: design.spares.power_array,
    },
    activeRepairs: {},
  };
}

/**
 * Processes hourly event progression, seeded draws, component failures, and SPE timers.
 * Spec B5.3, B5.4 Step 1, B5.5.
 */
export function stepEvents(
  t: number,
  currentState: EventsState,
  rng: () => number,
  params: LoadedParams,
): EventsStepResult {
  const missionHours = params.getNumber('mission.hours');
  const spePerMonth = params.getNumber('radiation.spe_per_month');
  const speWarningLeadH = params.getNumber('radiation.spe_warning_lead_h');
  const speDurationH = params.getNumber('radiation.spe_duration_h');

  const dustPerMonth = params.getNumber('power.dust_events_per_month');
  const dustDurationH = params.getNumber('power.dust_duration_h');

  // Spec B5.3: DRAW ORDER IS FIXED AND ALWAYS DRAWN
  const uSpe = rng();
  const uDust = rng();
  const uComp: Record<ComponentId, number> = {
    co2_scrubber: rng(),
    o2_generator: rng(),
    water_processor: rng(),
    power_array: rng(),
  };

  const logs: LogEntry[] = [];

  // Update existing dust event timer
  let dustRemainingH = currentState.dustRemainingH;
  if (dustRemainingH > 0) {
    dustRemainingH -= 1;
  }

  // Check new dust event trigger
  const dustThreshold = dustPerMonth / missionHours;
  if (uDust < dustThreshold) {
    if (dustRemainingH === 0) {
      logs.push({ t, type: 'dust_start', detail: 'Lunar surface dust storm initiated' });
    }
    dustRemainingH = dustDurationH; // Refresh duration (no stacking)
  }

  // Update SPE timers
  let speWarningLeadRemainingH = currentState.speWarningLeadRemainingH;
  let speActiveRemainingH = currentState.speActiveRemainingH;
  let isSpeWarningActive = currentState.isSpeWarningActive;

  if (speWarningLeadRemainingH > 0) {
    speWarningLeadRemainingH -= 1;
    if (speWarningLeadRemainingH === 0) {
      // Warning lead expired; SPE starts now
      speActiveRemainingH = speDurationH;
      isSpeWarningActive = false;
      logs.push({ t, type: 'spe_start', detail: 'Solar Particle Event flux commenced' });
    }
  } else if (speActiveRemainingH > 0) {
    speActiveRemainingH -= 1;
    if (speActiveRemainingH === 0) {
      logs.push({ t, type: 'spe_end', detail: 'Solar Particle Event flux ended' });
    }
  }

  // Check new SPE trigger (only if neither warning nor event is currently active)
  const speThreshold = spePerMonth / missionHours;
  if (speWarningLeadRemainingH === 0 && speActiveRemainingH === 0 && uSpe < speThreshold) {
    isSpeWarningActive = true;
    speWarningLeadRemainingH = speWarningLeadH;
    logs.push({
      t,
      type: 'spe_warning',
      detail: `SPE warning: event expected in ${speWarningLeadH} hours`,
    });
  }

  // Component failures
  const nextComponentsOk = { ...currentState.componentsOk };
  const nextSparesRemaining = { ...currentState.sparesRemaining };
  const nextActiveRepairs = { ...currentState.activeRepairs };

  for (let i = 0; i < COMPONENT_IDS.length; i++) {
    const compId = COMPONENT_IDS[i];
    if (!compId) continue;

    // Only functioning components can fail
    if (nextComponentsOk[compId]) {
      const mtbfH = params.getNumber(`failure.mtbf_h.${compId}`);
      const failureThreshold = 1 / mtbfH;
      const draw = uComp[compId];

      if (draw !== undefined && draw < failureThreshold) {
        nextComponentsOk[compId] = false;
        logs.push({
          t,
          type: 'component_failed',
          detail: `Component failure: ${compId}`,
        });

        const spares = nextSparesRemaining[compId] ?? 0;
        if (spares > 0) {
          nextSparesRemaining[compId] = spares - 1;
          const repairHours = params.getNumber(`repair.hours.${compId}`);
          nextActiveRepairs[compId] = repairHours;
        }
      }
    }
  }

  const isDustActive = dustRemainingH > 0;
  const isSpeActive = speActiveRemainingH > 0;

  return {
    state: {
      dustRemainingH,
      speWarningLeadRemainingH,
      speActiveRemainingH,
      isSpeWarningActive,
      componentsOk: nextComponentsOk,
      sparesRemaining: nextSparesRemaining,
      activeRepairs: nextActiveRepairs,
    },
    logs,
    isDustActive,
    isSpeActive,
    isSpeWarningActive,
  };
}
