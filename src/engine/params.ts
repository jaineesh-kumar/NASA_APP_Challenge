// Parameter loader and validation for Moonbase Margin
// Spec B6, A5.4, B4.3

import defaultParamsJson from '../../data/params.json' with { type: 'json' };
import { ConfidenceLevel, EngineError, ParamEntry, ParamsFile, SourceId } from './types.ts';

const VALID_SOURCES: ReadonlySet<string> = new Set([
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
  'S08',
  'S09',
  'S10',
  'S11',
  'ASSUMPTION',
  'DERIVED',
]);

const VALID_CONFIDENCES: ReadonlySet<string> = new Set(['high', 'medium', 'low']);

const ALLOWED_ENTRY_KEYS: ReadonlySet<string> = new Set([
  'value',
  'unit',
  'source',
  'confidence',
  'note',
]);

export const REQUIRED_PARAM_IDS: readonly string[] = [
  'mission.hours',
  'campaign.runs',
  'crew.size',
  'crew.o2_kg_per_day',
  'crew.co2_kg_per_day',
  'crew.water_total_kg_per_day',
  'crew.food_kcal_per_day',
  'crew.food_kg_per_day',
  'crew.productive_hours_per_day',
  'water.recovery_base',
  'water.recovery_upgraded',
  'o2.sabatier_recovery',
  'o2.electrolysis_water_per_o2',
  'o2.generator_capacity_factor',
  'co2.scrubber_capacity_factor',
  'co2.cabin_limit_kg',
  'loss.o2_deficit_hours',
  'loss.co2_over_hours',
  'loss.water_deficit_hours',
  'loss.food_shortfall_hours',
  'radiation.surface_usv_per_day',
  'radiation.iss_usv_per_day',
  'radiation.shield_factor_by_layers',
  'radiation.shelter_factor',
  'radiation.spe_multiplier',
  'radiation.spe_duration_h',
  'radiation.spe_warning_lead_h',
  'radiation.spe_per_month',
  'radiation.dose_limit_usv_mission',
  'power.panel_kw',
  'power.battery_kwh_per_unit',
  'power.charge_efficiency',
  'power.dust_events_per_month',
  'power.dust_factor',
  'power.dust_duration_h',
  'power.array_failure_factor',
  'power.mast_dark_reduction_per_level',
  'power.thermal_dark_multiplier',
  'load.life_support_kw',
  'load.thermal_kw',
  'load.comms_kw',
  'load.greenhouse_kw_per_module',
  'load.science_kw',
  'load.construction_kw',
  'site.ridge.dark_starts_h',
  'site.ridge.dark_length_h',
  'site.ridge.start_water_kg',
  'site.crater_edge.dark_starts_h',
  'site.crater_edge.dark_length_h',
  'site.crater_edge.start_water_kg',
  'site.dark_jitter_h',
  'start.o2_tank_kg',
  'start.food_kcal',
  'greenhouse.kcal_per_module_per_day',
  'greenhouse.water_kg_per_module_per_day',
  'greenhouse.crew_hours_per_module_per_tick',
  'greenhouse.low_power_factor',
  'construction.hours_per_shield_layer',
  'science.target_hours',
  'science.max_hours_per_tick',
  'failure.mtbf_h.co2_scrubber',
  'failure.mtbf_h.o2_generator',
  'failure.mtbf_h.water_processor',
  'failure.mtbf_h.power_array',
  'repair.hours.co2_scrubber',
  'repair.hours.o2_generator',
  'repair.hours.water_processor',
  'repair.hours.power_array',
  'mass.budget',
  'mass.panel',
  'mass.mast_level',
  'mass.battery',
  'mass.water_tier1',
  'mass.o2_tier1',
  'mass.greenhouse_module',
  'mass.shield_layer',
  'mass.spare',
  'rating.flight_ready_survival',
  'rating.flight_ready_success',
];

export class LoadedParams {
  readonly version: string;
  private readonly params: Map<string, ParamEntry>;

  constructor(file: ParamsFile) {
    this.version = file.version;
    this.params = new Map(Object.entries(file.params));
  }

  get(id: string): ParamEntry {
    const entry = this.params.get(id);
    if (!entry) {
      throw new EngineError('PARAM_NOT_FOUND', `Parameter id '${id}' not found in params.`);
    }
    return entry;
  }

  getNumber(id: string): number {
    const entry = this.get(id);
    if (typeof entry.value !== 'number') {
      throw new EngineError(
        'PARAM_TYPE_MISMATCH',
        `Expected numeric value for param '${id}', got ${typeof entry.value}.`,
      );
    }
    return entry.value;
  }

  getNumberArray(id: string): number[] {
    const entry = this.get(id);
    if (!Array.isArray(entry.value)) {
      throw new EngineError(
        'PARAM_TYPE_MISMATCH',
        `Expected array value for param '${id}', got ${typeof entry.value}.`,
      );
    }
    return [...entry.value];
  }

  allEntries(): Array<[string, ParamEntry]> {
    return Array.from(this.params.entries());
  }

  toObject(): ParamsFile {
    const result: Record<string, ParamEntry> = {};
    for (const [k, v] of this.params.entries()) {
      result[k] = v;
    }
    return {
      version: this.version,
      params: result,
    };
  }
}

/**
 * Loads and validates parameters from a JSON object or defaults to params.json.
 * Validates missing ids, unknown fields, wrong types, unknown source, and unknown confidence.
 * Throws EngineError if validation fails.
 */
export function loadParams(rawInput?: unknown): LoadedParams {
  const data = rawInput !== undefined ? rawInput : defaultParamsJson;

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new EngineError('INVALID_PARAMS_ROOT', 'Params root must be a JSON object.');
  }

  const record = data as Record<string, unknown>;

  if (typeof record['version'] !== 'string' || record['version'].trim() === '') {
    throw new EngineError('INVALID_VERSION', 'Params file must specify a valid string version.');
  }

  if (
    typeof record['params'] !== 'object' ||
    record['params'] === null ||
    Array.isArray(record['params'])
  ) {
    throw new EngineError('INVALID_PARAMS_SECTION', "Params file must contain a 'params' object.");
  }

  const rawParams = record['params'] as Record<string, unknown>;

  // Check for required IDs
  for (const id of REQUIRED_PARAM_IDS) {
    if (!(id in rawParams)) {
      throw new EngineError('MISSING_PARAM_ID', `Required parameter ID '${id}' is missing.`);
    }
  }

  const validatedParams: Record<string, ParamEntry> = {};

  for (const [id, entryRaw] of Object.entries(rawParams)) {
    if (typeof entryRaw !== 'object' || entryRaw === null || Array.isArray(entryRaw)) {
      throw new EngineError('INVALID_ENTRY_SHAPE', `Entry for '${id}' must be an object.`);
    }

    const entryObj = entryRaw as Record<string, unknown>;

    // Reject unknown fields in entry
    for (const key of Object.keys(entryObj)) {
      if (!ALLOWED_ENTRY_KEYS.has(key)) {
        throw new EngineError(
          'UNKNOWN_PARAM_FIELD',
          `Unknown field '${key}' in parameter entry for '${id}'.`,
        );
      }
    }

    // Validate value
    const val = entryObj['value'];
    const isNum = typeof val === 'number' && !Number.isNaN(val);
    const isNumArray =
      Array.isArray(val) &&
      val.length > 0 &&
      val.every((item) => typeof item === 'number' && !Number.isNaN(item));

    if (!isNum && !isNumArray) {
      throw new EngineError(
        'INVALID_PARAM_VALUE',
        `Value for '${id}' must be a number or non-empty array of numbers.`,
      );
    }

    // Validate unit
    const unit = entryObj['unit'];
    if (typeof unit !== 'string') {
      throw new EngineError('INVALID_PARAM_UNIT', `Unit for '${id}' must be a string.`);
    }

    // Validate source
    const source = entryObj['source'];
    if (typeof source !== 'string' || !VALID_SOURCES.has(source)) {
      throw new EngineError(
        'INVALID_PARAM_SOURCE',
        `Invalid source '${String(source)}' for '${id}'. Must be one of S01..S11, ASSUMPTION, DERIVED.`,
      );
    }

    // Validate confidence
    const confidence = entryObj['confidence'];
    if (typeof confidence !== 'string' || !VALID_CONFIDENCES.has(confidence)) {
      throw new EngineError(
        'INVALID_PARAM_CONFIDENCE',
        `Invalid confidence '${String(confidence)}' for '${id}'. Must be high, medium, or low.`,
      );
    }

    // Validate note
    const note = entryObj['note'];
    if (typeof note !== 'string') {
      throw new EngineError('INVALID_PARAM_NOTE', `Note for '${id}' must be a string.`);
    }

    validatedParams[id] = {
      value: isNumArray ? (val as number[]) : (val as number),
      unit,
      source: source as SourceId,
      confidence: confidence as ConfidenceLevel,
      note,
    };
  }

  return new LoadedParams({
    version: record['version'],
    params: validatedParams,
  });
}
