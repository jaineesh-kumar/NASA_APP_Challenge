// Dose with shielding, shelter and solar particle events
// Spec B5.4 step 8, B5.11

import { SimConstants } from './constants.ts';

export function shieldFactor(shieldBuilt: number, k: SimConstants): number {
  const f = k.shieldFactorByLayers;
  return f[Math.max(0, Math.min(f.length - 1, shieldBuilt))] ?? 1;
}

/**
 * Spec B5.4 step 8: dose added this hour in µSv.
 * `speMultiplier` is 1 with no active event, radiation.spe_multiplier for a random event,
 * or the flare-class value for a replayed real storm (B5.11).
 */
export function hourlyDoseUsv(
  shieldBuilt: number,
  isSheltering: boolean,
  speMultiplier: number,
  k: SimConstants,
): number {
  return (
    k.baseDoseUsvPerH *
    speMultiplier *
    shieldFactor(shieldBuilt, k) *
    (isSheltering ? k.shelterFactor : 1)
  );
}
