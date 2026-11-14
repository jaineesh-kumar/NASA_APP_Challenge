// Generation, demands, priority-ladder allocation and battery
// Spec B5.4 steps 3-4

import { SimConstants } from './constants.ts';
import { Design, LoadId } from './types.ts';

export type LoadFlags = Record<LoadId, boolean>;

export interface DemandInputs {
  inDarkWindow: boolean;
  ghLow: boolean;
  pauseScience: boolean;
  isSheltering: boolean;
  allShieldsBuilt: boolean;
  forcedOff: ReadonlySet<LoadId>;
}

export interface AllocationResult {
  /** Load is running this tick. Forced-off loads are never running. */
  powered: LoadFlags;
  /** Load wanted power (> 0 kW, not forced off) but the ladder ran out. */
  starved: LoadFlags;
  suppliedKw: number;
}

// Spec B5.4 step 3
export function computeGeneration(
  panels: number,
  inDarkWindow: boolean,
  isDustActive: boolean,
  isArrayFailed: boolean,
  k: SimConstants,
): number {
  if (inDarkWindow) return 0;
  return (
    panels *
    k.panelKw *
    (isDustActive ? k.dustFactor : 1) *
    (isArrayFailed ? k.arrayFailureFactor : 1)
  );
}

// Spec B5.4 step 4 (demands)
export function computeDemands(
  design: Design,
  input: DemandInputs,
  k: SimConstants,
): Record<LoadId, number> {
  const off = input.forcedOff;
  const shelter = input.isSheltering;
  return {
    life_support: off.has('life_support') ? 0 : k.loadKw.life_support,
    thermal: off.has('thermal')
      ? 0
      : k.loadKw.thermal * (input.inDarkWindow ? k.thermalDarkMultiplier : 1),
    comms: off.has('comms') ? 0 : k.loadKw.comms,
    greenhouse: off.has('greenhouse')
      ? 0
      : design.greenhouseModules *
        k.greenhouseKwPerModule *
        (input.ghLow ? k.greenhouseLowPowerFactor : 1),
    science: off.has('science') || input.pauseScience || shelter ? 0 : k.loadKw.science,
    construction:
      off.has('construction') || input.allShieldsBuilt || shelter ? 0 : k.loadKw.construction,
  };
}

/**
 * Spec B5.4 step 4: walk the ladder from index 0; a load runs if its demand fits in what is
 * left (all or nothing).
 */
export function allocatePower(
  availableKw: number,
  priority: readonly LoadId[],
  demands: Readonly<Record<LoadId, number>>,
  forcedOff: ReadonlySet<LoadId>,
): AllocationResult {
  const powered: LoadFlags = {
    life_support: false,
    thermal: false,
    comms: false,
    greenhouse: false,
    science: false,
    construction: false,
  };
  const starved: LoadFlags = { ...powered };
  let remaining = availableKw;
  let suppliedKw = 0;
  for (const load of priority) {
    if (forcedOff.has(load)) continue;
    const d = demands[load];
    if (d <= remaining) {
      powered[load] = true;
      remaining -= d;
      suppliedKw += d;
    } else {
      starved[load] = true;
    }
  }
  return { powered, starved, suppliedKw };
}

// Spec B5.4 step 4 (battery)
export function updateBattery(
  batteryKwh: number,
  capacityKwh: number,
  genKw: number,
  suppliedKw: number,
  k: SimConstants,
): number {
  if (genKw >= suppliedKw) {
    return Math.min(capacityKwh, batteryKwh + (genKw - suppliedKw) * k.chargeEfficiency);
  }
  // supplied <= gen + battery by construction; max() only guards float rounding.
  return Math.max(0, batteryKwh - (suppliedKw - genKw));
}
