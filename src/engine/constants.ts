// Pre-resolved simulation constants.
// Why: a 300-run campaign is 216,000 ticks; resolving ~60 params by string id every tick was
// the main cost of a campaign. Every number still comes from params.json (A5.4); this module
// only reads them once per LoadedParams instance and derives per-tick rates.

import { LoadedParams } from './params.ts';
import { ComponentId, LoadId, SiteId } from './types.ts';

export const COMPONENT_IDS: readonly ComponentId[] = [
  'co2_scrubber',
  'o2_generator',
  'water_processor',
  'power_array',
];

export const LOAD_IDS: readonly LoadId[] = [
  'life_support',
  'thermal',
  'comms',
  'greenhouse',
  'science',
  'construction',
];

export const SITE_IDS: readonly SiteId[] = ['ridge', 'crater_edge'];

export interface SimConstants {
  missionHours: number;
  campaignRuns: number;
  crewSize: number;
  // Per-tick crew rates (Spec B5.4 steps 5-7)
  o2NeedKgPerH: number;
  co2ProdKgPerH: number;
  waterGrossKgPerH: number;
  foodNeedKcalPerH: number;
  o2KgPerDayCrew: number; // crew.size * crew.o2_kg_per_day, for "O2 days"
  foodKcalPerDayCrew: number;
  crewPoolHPerTick: number;
  // Life support
  recoveryBase: number;
  recoveryUpgraded: number;
  sabatierRecovery: number;
  electrolysisWaterPerO2: number;
  o2GeneratorCapacityFactor: number;
  co2ScrubberCapacityFactor: number;
  co2CabinLimitKg: number;
  lossO2Hours: number;
  lossCo2Hours: number;
  lossWaterHours: number;
  lossFoodHours: number;
  // Radiation
  baseDoseUsvPerH: number;
  shieldFactorByLayers: readonly number[];
  shelterFactor: number;
  speMultiplier: number;
  speDurationH: number;
  doseLimitUsv: number;
  // Power
  panelKw: number;
  batteryKwhPerUnit: number;
  chargeEfficiency: number;
  dustChancePerTick: number;
  dustFactor: number;
  dustDurationH: number;
  arrayFailureFactor: number;
  mastDarkReductionPerLevel: number;
  thermalDarkMultiplier: number;
  loadKw: Readonly<
    Record<'life_support' | 'thermal' | 'comms' | 'science' | 'construction', number>
  >;
  greenhouseKwPerModule: number;
  // Greenhouse, crew work
  greenhouseLowPowerFactor: number;
  greenhouseKcalPerModulePerH: number;
  greenhouseWaterKgPerModulePerH: number;
  greenhouseCrewHPerModulePerTick: number;
  hoursPerShieldLayer: number;
  scienceTargetHours: number;
  scienceMaxHoursPerTick: number;
  // Failures
  failureChancePerTick: Readonly<Record<ComponentId, number>>;
  repairHours: Readonly<Record<ComponentId, number>>;
  // Start state and sites
  startO2TankKg: number;
  startFoodKcal: number;
  startWaterKg: Readonly<Record<SiteId, number>>;
  darkStartsH: Readonly<Record<SiteId, readonly number[]>>;
  darkLengthH: Readonly<Record<SiteId, number>>;
  darkJitterH: number;
  // Rating
  flightReadySurvival: number;
  flightReadySuccess: number;
}

const cache = new WeakMap<LoadedParams, SimConstants>();

function perSite<T>(fn: (site: SiteId) => T): Record<SiteId, T> {
  return { ridge: fn('ridge'), crater_edge: fn('crater_edge') };
}

function perComponent(fn: (id: ComponentId) => number): Record<ComponentId, number> {
  return {
    co2_scrubber: fn('co2_scrubber'),
    o2_generator: fn('o2_generator'),
    water_processor: fn('water_processor'),
    power_array: fn('power_array'),
  };
}

export function getSimConstants(params: LoadedParams): SimConstants {
  const hit = cache.get(params);
  if (hit) return hit;

  const n = (id: string) => params.getNumber(id);
  const crewSize = n('crew.size');
  const missionHours = n('mission.hours');

  const k: SimConstants = {
    missionHours,
    campaignRuns: n('campaign.runs'),
    crewSize,
    o2NeedKgPerH: (crewSize * n('crew.o2_kg_per_day')) / 24,
    co2ProdKgPerH: (crewSize * n('crew.co2_kg_per_day')) / 24,
    waterGrossKgPerH: (crewSize * n('crew.water_total_kg_per_day')) / 24,
    foodNeedKcalPerH: (crewSize * n('crew.food_kcal_per_day')) / 24,
    o2KgPerDayCrew: crewSize * n('crew.o2_kg_per_day'),
    foodKcalPerDayCrew: crewSize * n('crew.food_kcal_per_day'),
    crewPoolHPerTick: (crewSize * n('crew.productive_hours_per_day')) / 24,
    recoveryBase: n('water.recovery_base'),
    recoveryUpgraded: n('water.recovery_upgraded'),
    sabatierRecovery: n('o2.sabatier_recovery'),
    electrolysisWaterPerO2: n('o2.electrolysis_water_per_o2'),
    o2GeneratorCapacityFactor: n('o2.generator_capacity_factor'),
    co2ScrubberCapacityFactor: n('co2.scrubber_capacity_factor'),
    co2CabinLimitKg: n('co2.cabin_limit_kg'),
    lossO2Hours: n('loss.o2_deficit_hours'),
    lossCo2Hours: n('loss.co2_over_hours'),
    lossWaterHours: n('loss.water_deficit_hours'),
    lossFoodHours: n('loss.food_shortfall_hours'),
    baseDoseUsvPerH: n('radiation.surface_usv_per_day') / 24,
    shieldFactorByLayers: params.getNumberArray('radiation.shield_factor_by_layers'),
    shelterFactor: n('radiation.shelter_factor'),
    speMultiplier: n('radiation.spe_multiplier'),
    speDurationH: n('radiation.spe_duration_h'),
    doseLimitUsv: n('radiation.dose_limit_usv_mission'),
    panelKw: n('power.panel_kw'),
    batteryKwhPerUnit: n('power.battery_kwh_per_unit'),
    chargeEfficiency: n('power.charge_efficiency'),
    dustChancePerTick: n('power.dust_events_per_month') / missionHours,
    dustFactor: n('power.dust_factor'),
    dustDurationH: n('power.dust_duration_h'),
    arrayFailureFactor: n('power.array_failure_factor'),
    mastDarkReductionPerLevel: n('power.mast_dark_reduction_per_level'),
    thermalDarkMultiplier: n('power.thermal_dark_multiplier'),
    loadKw: {
      life_support: n('load.life_support_kw'),
      thermal: n('load.thermal_kw'),
      comms: n('load.comms_kw'),
      science: n('load.science_kw'),
      construction: n('load.construction_kw'),
    },
    greenhouseKwPerModule: n('load.greenhouse_kw_per_module'),
    greenhouseLowPowerFactor: n('greenhouse.low_power_factor'),
    greenhouseKcalPerModulePerH: n('greenhouse.kcal_per_module_per_day') / 24,
    greenhouseWaterKgPerModulePerH: n('greenhouse.water_kg_per_module_per_day') / 24,
    greenhouseCrewHPerModulePerTick: n('greenhouse.crew_hours_per_module_per_tick'),
    hoursPerShieldLayer: n('construction.hours_per_shield_layer'),
    scienceTargetHours: n('science.target_hours'),
    scienceMaxHoursPerTick: n('science.max_hours_per_tick'),
    failureChancePerTick: perComponent((id) => 1 / n(`failure.mtbf_h.${id}`)),
    repairHours: perComponent((id) => n(`repair.hours.${id}`)),
    startO2TankKg: n('start.o2_tank_kg'),
    startFoodKcal: n('start.food_kcal'),
    startWaterKg: perSite((s) => n(`site.${s}.start_water_kg`)),
    darkStartsH: perSite((s) => params.getNumberArray(`site.${s}.dark_starts_h`)),
    darkLengthH: perSite((s) => n(`site.${s}.dark_length_h`)),
    darkJitterH: n('site.dark_jitter_h'),
    flightReadySurvival: n('rating.flight_ready_survival'),
    flightReadySuccess: n('rating.flight_ready_success'),
  };
  cache.set(params, k);
  return k;
}
