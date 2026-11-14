// Crew-hour allocation: greenhouse, science, construction, repairs
// Spec B5.4 step 6

import { COMPONENT_IDS, SimConstants } from './constants.ts';
import { ComponentId, Design } from './types.ts';

export type CrewTask = 'greenhouse' | 'science' | 'construction' | 'repairs';

export interface CrewInputs {
  isSheltering: boolean;
  repairFirst: boolean;
  pauseScience: boolean;
  isGreenhousePowered: boolean;
  isSciencePowered: boolean;
  isConstructionPowered: boolean;
  shieldBuilt: number;
  shieldProgressH: number;
  /** Remaining repair hours per failed component; Infinity = no spare, cannot repair. */
  repairsLeftH: Readonly<Partial<Record<ComponentId, number>>>;
}

export interface CrewStep {
  poolH: number;
  hours: Record<CrewTask, number>;
  greenhouseNeedH: number;
  shieldBuilt: number;
  shieldProgressH: number;
  isLayerCompleted: boolean;
  repairsLeftH: Readonly<Partial<Record<ComponentId, number>>>;
  repaired: ComponentId[];
}

const DEFAULT_ORDER: readonly CrewTask[] = ['greenhouse', 'science', 'construction', 'repairs'];
const REPAIR_FIRST_ORDER: readonly CrewTask[] = [
  'repairs',
  'greenhouse',
  'science',
  'construction',
];
// Built once: this runs every tick, so it must not allocate.
const ORDERS: Readonly<Record<string, readonly CrewTask[]>> = {
  '00': DEFAULT_ORDER,
  '10': REPAIR_FIRST_ORDER,
  '01': DEFAULT_ORDER.filter((t) => t !== 'science'),
  '11': REPAIR_FIRST_ORDER.filter((t) => t !== 'science'),
};

export function crewTaskOrder(repairFirst: boolean, pauseScience: boolean): readonly CrewTask[] {
  return ORDERS[`${repairFirst ? 1 : 0}${pauseScience ? 1 : 0}`] ?? DEFAULT_ORDER;
}

export function allocateCrewTime(design: Design, input: CrewInputs, k: SimConstants): CrewStep {
  const poolH = input.isSheltering ? 0 : k.crewPoolHPerTick;
  const layersLeft = input.shieldBuilt < design.shieldingLayers;

  let repairNeed = 0;
  for (const id of COMPONENT_IDS) {
    const left = input.repairsLeftH[id];
    if (left !== undefined && Number.isFinite(left)) repairNeed += left;
  }
  const greenhouseNeedH = input.isGreenhousePowered
    ? design.greenhouseModules * k.greenhouseCrewHPerModulePerTick
    : 0;
  const need: Record<CrewTask, number> = {
    greenhouse: greenhouseNeedH,
    science: input.isSciencePowered ? k.scienceMaxHoursPerTick : 0,
    construction:
      input.isConstructionPowered && layersLeft ? k.hoursPerShieldLayer - input.shieldProgressH : 0,
    repairs: repairNeed,
  };

  const hours: Record<CrewTask, number> = {
    greenhouse: 0,
    science: 0,
    construction: 0,
    repairs: 0,
  };
  let left = poolH;
  for (const task of crewTaskOrder(input.repairFirst, input.pauseScience)) {
    if (left <= 0) break;
    const h = Math.min(left, need[task]);
    hours[task] = h;
    left -= h;
  }

  let shieldBuilt = input.shieldBuilt;
  let shieldProgressH = input.shieldProgressH + hours.construction;
  let isLayerCompleted = false;
  if (layersLeft && shieldProgressH >= k.hoursPerShieldLayer) {
    shieldBuilt = Math.min(design.shieldingLayers, shieldBuilt + 1);
    shieldProgressH = 0;
    isLayerCompleted = true;
  }

  // Repairs go to failed components in ComponentId order.
  const repaired: ComponentId[] = [];
  let repairPool = hours.repairs;
  if (repairPool <= 0) {
    // Nothing to change: reuse the input object (the common case, no allocation).
    return {
      poolH,
      hours,
      greenhouseNeedH,
      shieldBuilt,
      shieldProgressH,
      isLayerCompleted,
      repairsLeftH: input.repairsLeftH,
      repaired,
    };
  }
  const repairsLeftH: Partial<Record<ComponentId, number>> = { ...input.repairsLeftH };
  for (const id of COMPONENT_IDS) {
    const rem = repairsLeftH[id];
    if (rem === undefined || !Number.isFinite(rem) || repairPool <= 0) continue;
    const h = Math.min(repairPool, rem);
    repairPool -= h;
    const next = rem - h;
    if (next <= 1e-9) {
      delete repairsLeftH[id];
      repaired.push(id);
    } else {
      repairsLeftH[id] = next;
    }
  }

  return {
    poolH,
    hours,
    greenhouseNeedH,
    shieldBuilt,
    shieldProgressH,
    isLayerCompleted,
    repairsLeftH,
    repaired,
  };
}
