// Dose with shielding, shelter and solar storms
// Spec B5.4 step 8

import { SimConstants } from './constants.ts';

export function shieldFactor(shieldBuilt: number, k: SimConstants): number {
  const f = k.shieldFactorByLayers;
  return f[Math.max(0, Math.min(f.length - 1, shieldBuilt))] ?? 1;
}

/** Dose added this hour in µSv. */
export function hourlyDoseUsv(
  shieldBuilt: number,
  isSheltering: boolean,
  isStormActive: boolean,
  k: SimConstants,
): number {
  return (
    k.baseDoseUsvPerH *
    (isStormActive ? k.speMultiplier : 1) *
    shieldFactor(shieldBuilt, k) *
    (isSheltering ? k.shelterFactor : 1)
  );
}
