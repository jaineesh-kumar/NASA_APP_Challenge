// Radiation accumulation, shielding factors, shelter mode, and SPE multipliers
// Spec B5.4 (Step 9), B5.5

import { LoadedParams } from './params.ts';

export interface RadiationStepResult {
  nextDoseUsv: number;
  hourlyDoseUsv: number;
  shieldFactor: number;
  shelterFactor: number;
  speMultiplier: number;
  doseOverLimit: boolean;
}

/**
 * Calculates hourly radiation dose increment.
 * Spec B5.4 Step 9:
 * hourlyBase = radiation.surface_usv_per_day / 24
 * shieldFactor = radiation.shield_factor_by_layers[shieldBuilt]
 * shelterFactor = isSheltering ? radiation.shelter_factor : 1
 * speMult = isSpeActive ? radiation.spe_multiplier : 1
 * doseUsv += hourlyBase * shieldFactor * shelterFactor * speMult
 * If doseUsv > radiation.dose_limit_usv_mission: flag dose deficit.
 */
export function stepRadiation(
  currentDoseUsv: number,
  shieldBuilt: number,
  isSheltering: boolean,
  isSpeActive: boolean,
  params: LoadedParams,
): RadiationStepResult {
  const surfaceUsvPerDay = params.getNumber('radiation.surface_usv_per_day');
  const shieldFactors = params.getNumberArray('radiation.shield_factor_by_layers');
  const shelterFactorValue = params.getNumber('radiation.shelter_factor');
  const speMultiplierValue = params.getNumber('radiation.spe_multiplier');
  const doseLimit = params.getNumber('radiation.dose_limit_usv_mission');

  const hourlyBase = surfaceUsvPerDay / 24;

  const layerIndex = Math.max(0, Math.min(shieldFactors.length - 1, shieldBuilt));
  const shieldFactor = shieldFactors[layerIndex] ?? 1.0;
  const shelterFactor = isSheltering ? shelterFactorValue : 1.0;
  const speMultiplier = isSpeActive ? speMultiplierValue : 1.0;

  const hourlyDoseUsv = hourlyBase * shieldFactor * shelterFactor * speMultiplier;
  const nextDoseUsv = currentDoseUsv + hourlyDoseUsv;
  const doseOverLimit = nextDoseUsv > doseLimit;

  return {
    nextDoseUsv,
    hourlyDoseUsv,
    shieldFactor,
    shelterFactor,
    speMultiplier,
    doseOverLimit,
  };
}
