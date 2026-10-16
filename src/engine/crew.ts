// Crew time budgeting, priority allocation, repairs, and shield construction
// Spec B5.4 (Step 8), B5.5

import { LoadedParams } from './params.ts';
import { ComponentId, Design } from './types.ts';

export interface CrewAllocationResult {
  hoursAllocated: {
    repairs: number;
    greenhouse: number;
    construction: number;
    science: number;
    unused: number;
  };
  ghLaborFraction: number;
  updatedShieldBuilt: number;
  updatedShieldProgressH: number;
  layerCompletedThisTick: boolean;
  updatedScienceHours: number;
  remainingRepairs: Partial<Record<ComponentId, number>>;
  repairedThisTick: ComponentId[];
}

/**
 * Allocates productive crew hours according to the strict priority sequence:
 * 1. Active repairs
 * 2. Greenhouse maintenance
 * 3. Shield construction
 * 4. Science experiments
 *
 * Spec B5.4 Step 8.
 */
export function allocateCrewTime(
  design: Design,
  activeRepairs: Partial<Record<ComponentId, number>>, // componentId -> remaining repair hours
  currentShieldBuilt: number,
  currentShieldProgressH: number,
  currentScienceHours: number,
  isGreenhousePowered: boolean,
  isConstructionPowered: boolean,
  isSciencePowered: boolean,
  isSheltering: boolean,
  isSciencePaused: boolean,
  params: LoadedParams,
): CrewAllocationResult {
  const crewSize = params.getNumber('crew.size');
  const productiveHoursPerDay = params.getNumber('crew.productive_hours_per_day');
  const ghHoursPerModulePerTick = params.getNumber('greenhouse.crew_hours_per_module_per_tick');
  const hoursPerShieldLayer = params.getNumber('construction.hours_per_shield_layer');
  const scienceMaxHoursPerTick = params.getNumber('science.max_hours_per_tick');

  let availableHours = (crewSize * productiveHoursPerDay) / 24;
  let repairHoursSpent = 0;
  let ghHoursSpent = 0;
  let constructionHoursSpent = 0;
  let scienceHoursSpent = 0;

  // 1. Active repairs
  const remainingRepairs: Partial<Record<ComponentId, number>> = { ...activeRepairs };
  const repairedThisTick: ComponentId[] = [];

  const componentsOrder: readonly ComponentId[] = [
    'co2_scrubber',
    'o2_generator',
    'water_processor',
    'power_array',
  ];

  for (let i = 0; i < componentsOrder.length; i++) {
    const compId = componentsOrder[i];
    if (!compId) continue;

    const needed = remainingRepairs[compId];
    if (needed !== undefined && needed > 0 && availableHours > 0) {
      const commit = Math.min(availableHours, needed);
      repairHoursSpent += commit;
      availableHours -= commit;
      const leftover = needed - commit;
      if (leftover <= 0) {
        delete remainingRepairs[compId];
        repairedThisTick.push(compId);
      } else {
        remainingRepairs[compId] = leftover;
      }
    }
  }

  // 2. Greenhouse maintenance
  let ghLaborFraction = 1.0;
  if (isGreenhousePowered && design.greenhouseModules > 0) {
    const demand = design.greenhouseModules * ghHoursPerModulePerTick;
    if (availableHours >= demand) {
      ghHoursSpent = demand;
      availableHours -= demand;
      ghLaborFraction = 1.0;
    } else if (demand > 0) {
      ghHoursSpent = availableHours;
      ghLaborFraction = availableHours / demand;
      availableHours = 0;
    }
  }

  // 3. Shield construction
  let updatedShieldBuilt = currentShieldBuilt;
  let updatedShieldProgressH = currentShieldProgressH;
  let layerCompletedThisTick = false;

  const canConstruct =
    !isSheltering &&
    isConstructionPowered &&
    updatedShieldBuilt < design.shieldingLayers &&
    availableHours > 0;

  if (canConstruct) {
    const neededForLayer = hoursPerShieldLayer - updatedShieldProgressH;
    const commit = Math.min(availableHours, neededForLayer);
    constructionHoursSpent += commit;
    availableHours -= commit;
    updatedShieldProgressH += commit;

    if (updatedShieldProgressH >= hoursPerShieldLayer) {
      updatedShieldBuilt += 1;
      updatedShieldProgressH = 0;
      layerCompletedThisTick = true;
    }
  }

  // 4. Science experiments
  let updatedScienceHours = currentScienceHours;
  const canDoScience = !isSheltering && !isSciencePaused && isSciencePowered && availableHours > 0;

  if (canDoScience) {
    const commit = Math.min(availableHours, scienceMaxHoursPerTick);
    scienceHoursSpent += commit;
    availableHours -= commit;
    updatedScienceHours += commit;
  }

  return {
    hoursAllocated: {
      repairs: repairHoursSpent,
      greenhouse: ghHoursSpent,
      construction: constructionHoursSpent,
      science: scienceHoursSpent,
      unused: availableHours,
    },
    ghLaborFraction,
    updatedShieldBuilt,
    updatedShieldProgressH,
    layerCompletedThisTick,
    updatedScienceHours,
    remainingRepairs,
    repairedThisTick,
  };
}
