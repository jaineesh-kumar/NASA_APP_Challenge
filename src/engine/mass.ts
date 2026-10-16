// Launch mass accounting and budget enforcement
// Spec B5.8

import { LoadedParams } from './params.ts';
import { Design } from './types.ts';

/**
 * Calculates total launch mass ("mu") for a given base design.
 * Spec B5.8:
 * massUsed = panels*mass.panel + mastLevel*mass.mast_level + batteries*mass.battery +
 *            waterLoopTier*mass.water_tier1 + o2LoopTier*mass.o2_tier1 +
 *            greenhouseModules*mass.greenhouse_module + shieldingLayers*mass.shield_layer +
 *            (sum of spares)*mass.spare
 */
export function massUsed(design: Design, params: LoadedParams): number {
  const panelMass = params.getNumber('mass.panel');
  const mastLevelMass = params.getNumber('mass.mast_level');
  const batteryMass = params.getNumber('mass.battery');
  const waterTier1Mass = params.getNumber('mass.water_tier1');
  const o2Tier1Mass = params.getNumber('mass.o2_tier1');
  const greenhouseModuleMass = params.getNumber('mass.greenhouse_module');
  const shieldLayerMass = params.getNumber('mass.shield_layer');
  const spareMass = params.getNumber('mass.spare');

  const sparesCount =
    design.spares.co2_scrubber +
    design.spares.o2_generator +
    design.spares.water_processor +
    design.spares.power_array;

  return (
    design.panels * panelMass +
    design.mastLevel * mastLevelMass +
    design.batteries * batteryMass +
    design.waterLoopTier * waterTier1Mass +
    design.o2LoopTier * o2Tier1Mass +
    design.greenhouseModules * greenhouseModuleMass +
    design.shieldingLayers * shieldLayerMass +
    sparesCount * spareMass
  );
}

/**
 * Checks whether a design's mass fits within the launch mass budget.
 * Spec B5.8: massUsed <= mass.budget
 */
export function isWithinBudget(design: Design, params: LoadedParams): boolean {
  const budget = params.getNumber('mass.budget');
  return massUsed(design, params) <= budget;
}
