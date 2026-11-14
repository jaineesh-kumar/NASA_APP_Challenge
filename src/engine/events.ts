// Seeded dust events and component failures; real solar storm timeline
// Spec B5.3, B5.5, ADR-005

import { COMPONENT_IDS, SimConstants } from './constants.ts';
import { ScheduledStorm } from './spaceWeather.ts';
import { ComponentId, Design } from './types.ts';

export interface EventsState {
  dustLeftH: number;
  isOk: Record<ComponentId, boolean>;
  sparesLeft: Record<ComponentId, number>;
  /** Remaining crew-hours per failed component; Infinity = permanent (no spare). */
  repairsLeftH: Readonly<Partial<Record<ComponentId, number>>>;
}

export interface EventsStep {
  state: EventsState;
  isDustStarted: boolean;
  failed: ComponentId[];
}

export { COMPONENT_IDS };

export function createInitialEventsState(design: Design): EventsState {
  return {
    dustLeftH: 0,
    isOk: { co2_scrubber: true, o2_generator: true, water_processor: true, power_array: true },
    sparesLeft: { ...design.spares },
    repairsLeftH: {},
  };
}

/**
 * Spec B5.3 (as amended by ADR-005): every tick draws, always and in this order,
 * uDust then one draw per component in ComponentId order. Solar storms are no longer drawn;
 * they come from the real DONKI record (one window draw before tick 0).
 */
export function stepEvents(s: EventsState, rng: () => number, k: SimConstants): EventsStep {
  const uDust = rng();
  const uComp = [rng(), rng(), rng(), rng()];

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
  if (failed.length === 0) {
    // Common case: only the dust timer changed, so share the other fields (no copies).
    return { state: { ...s, dustLeftH }, isDustStarted, failed };
  }
  const isOk = { ...s.isOk };
  const sparesLeft = { ...s.sparesLeft };
  const repairsLeftH = { ...s.repairsLeftH };
  failed.forEach((id) => {
    isOk[id] = false;
    if (sparesLeft[id] > 0) {
      sparesLeft[id] -= 1;
      repairsLeftH[id] = k.repairHours[id];
    } else {
      repairsLeftH[id] = Infinity;
    }
  });

  return { state: { dustLeftH, isOk, sparesLeft, repairsLeftH }, isDustStarted, failed };
}

/** Hour mask of active storm radiation; overlapping storms merge. */
export function buildStormMask(storms: readonly ScheduledStorm[], k: SimConstants): Uint8Array {
  const mask = new Uint8Array(k.missionHours);
  for (const s of storms)
    mask.fill(1, s.onsetH, Math.min(k.missionHours, s.onsetH + k.speDurationH));
  return mask;
}
