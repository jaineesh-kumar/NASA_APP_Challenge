// Seeded events: solar particle events, dust, component failures
// Spec B5.3, B5.4 step 1, B5.5

import { COMPONENT_IDS, SimConstants } from './constants.ts';
import { ComponentId, Design } from './types.ts';

/** A scheduled solar particle event: warned from warnH, active in [onsetH, endH). */
export interface ScheduledSpe {
  warnH: number;
  onsetH: number;
  endH: number;
  multiplier: number;
}

export interface EventsState {
  spe: ScheduledSpe | null;
  dustLeftH: number;
  isOk: Record<ComponentId, boolean>;
  sparesLeft: Record<ComponentId, number>;
  /** Remaining crew-hours per failed component; Infinity = permanent (no spare). */
  repairsLeftH: Readonly<Partial<Record<ComponentId, number>>>;
}

export interface EventsStep {
  state: EventsState;
  isSpeWarningStarted: boolean;
  isSpeStarted: boolean;
  isSpeEnded: boolean;
  /** Spec B5.5: true from the draw until the event ends (pending or active). */
  isSpeWarning: boolean;
  /** Storm multiplier this hour (1 when no event is active). */
  speMultiplier: number;
  isDustStarted: boolean;
  failed: ComponentId[];
}

export { COMPONENT_IDS };

export function createInitialEventsState(
  design: Design,
  spe: ScheduledSpe | null = null,
): EventsState {
  return {
    spe,
    dustLeftH: 0,
    isOk: { co2_scrubber: true, o2_generator: true, water_processor: true, power_array: true },
    sparesLeft: { ...design.spares },
    repairsLeftH: {},
  };
}

/**
 * Spec B5.3 + B5.5. Every tick draws, always and in this order: uSpe, uDust, then one draw
 * per component in ComponentId order. `allowRandomSpe` is false in replay mode (B5.11): the
 * uSpe draw still happens so all other randomness is unchanged, but it cannot start an event.
 */
export function stepEvents(
  s: EventsState,
  t: number,
  rng: () => number,
  k: SimConstants,
  allowRandomSpe = true,
  /** Spec B5.10: 1 - comms.repair_assist_fraction while the ground link is up, else 1. */
  repairFactor = 1,
): EventsStep {
  const uSpe = rng();
  const uDust = rng();
  const uComp = [rng(), rng(), rng(), rng()];

  // Scheduled SPE milestones for hour t, then a possible new event.
  let spe = s.spe;
  let isSpeEnded = false;
  if (spe && t >= spe.endH) {
    spe = null;
    isSpeEnded = true;
  }
  if (spe === null && allowRandomSpe && uSpe < k.speChancePerTick) {
    const onsetH = t + k.speWarningLeadH;
    spe = { warnH: t, onsetH, endH: onsetH + k.speDurationH, multiplier: k.speMultiplier };
  }
  const isSpeWarningStarted = spe !== null && t === spe.warnH;
  const isSpeActive = spe !== null && t >= spe.onsetH && t < spe.endH;
  const isSpeStarted = spe !== null && t === spe.onsetH;

  let dustLeftH = s.dustLeftH > 0 ? s.dustLeftH - 1 : 0;
  let isDustStarted = false;
  if (uDust < k.dustChancePerTick) {
    isDustStarted = dustLeftH === 0;
    dustLeftH = k.dustDurationH; // refresh, no stacking
  }

  const failed: ComponentId[] = [];
  COMPONENT_IDS.forEach((id, i) => {
    if (s.isOk[id] && (uComp[i] ?? 1) < k.failureChancePerTick[id]) failed.push(id);
  });

  let state: EventsState;
  if (failed.length === 0) {
    // Common case: share the unchanged maps (no copies).
    state = { ...s, spe, dustLeftH };
  } else {
    const isOk = { ...s.isOk };
    const sparesLeft = { ...s.sparesLeft };
    const repairsLeftH = { ...s.repairsLeftH };
    for (const id of failed) {
      isOk[id] = false;
      if (sparesLeft[id] > 0) {
        sparesLeft[id] -= 1;
        repairsLeftH[id] = k.repairHours[id] * repairFactor;
      } else {
        repairsLeftH[id] = Infinity;
      }
    }
    state = { spe, dustLeftH, isOk, sparesLeft, repairsLeftH };
  }

  return {
    state,
    isSpeWarningStarted,
    isSpeStarted,
    isSpeEnded,
    isSpeWarning: spe !== null && t >= spe.warnH,
    speMultiplier: isSpeActive && spe ? spe.multiplier : 1,
    isDustStarted,
    failed,
  };
}
