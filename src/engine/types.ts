// Types definition for Moonbase Margin simulation engine
// Spec B5.2 and B4.3

export class EngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'EngineError';
    this.code = code;
    Object.setPrototypeOf(this, EngineError.prototype);
  }
}

export type SiteId = 'ridge' | 'crater_edge';
export type LoadId =
  'life_support' | 'thermal' | 'comms' | 'greenhouse' | 'science' | 'construction';
export type ComponentId = 'co2_scrubber' | 'o2_generator' | 'water_processor' | 'power_array';
export type FailureCause = 'oxygen' | 'co2' | 'water' | 'food' | 'dose';

export interface Design {
  site: SiteId;
  panels: number; // integer 1..8
  mastLevel: 0 | 1 | 2 | 3;
  batteries: number; // integer 1..12
  waterLoopTier: 0 | 1; // 0 base recovery, 1 brine-processor upgrade
  o2LoopTier: 0 | 1; // 0 none, 1 Sabatier
  greenhouseModules: 0 | 1 | 2 | 3;
  shieldingLayers: 0 | 1 | 2 | 3;
  spares: Record<ComponentId, 0 | 1 | 2>;
}

export type Condition =
  | { kind: 'battery_below_pct'; value: number }
  | { kind: 'spe_warning' }
  | { kind: 'o2_days_below'; value: number }
  | { kind: 'dark_window_within_h'; value: number }
  | { kind: 'component_failed' };

export type Action =
  | { kind: 'shed'; load: LoadId }
  | { kind: 'shelter' }
  | { kind: 'repair_first' }
  | { kind: 'greenhouse_low_power' }
  | { kind: 'pause_science' };

export interface IfThenRule {
  condition: Condition;
  action: Action;
}

export interface Rules {
  priority: LoadId[]; // permutation of all 6 LoadId; index 0 is shed last
  ifThen: IfThenRule[]; // length 0..5
}

export type LogType =
  | 'dark_window_start'
  | 'dark_window_end'
  | 'dust_start'
  | 'spe_warning'
  | 'spe_start'
  | 'spe_end'
  | 'component_failed'
  | 'component_repaired'
  | 'battery_empty'
  | 'load_off'
  | 'shield_layer_built'
  | 'rule_fired'
  | 'failure';

export interface LogEntry {
  t: number;
  type: LogType;
  detail: string;
}

export interface MissionResult {
  seed: number;
  survived: boolean;
  failureCause: FailureCause | null;
  failureHour: number | null;
  scienceMet: boolean;
  minBatteryPct: number;
  minO2Days: number;
  peakDoseUsv: number;
  log: LogEntry[];
}

export interface Interval {
  low: number;
  high: number;
}

export interface CampaignResult {
  runs: number;
  survivalRate: number;
  successRate: number;
  survivalCi: Interval;
  successCi: Interval;
  minBatteryPctP5: number;
  minO2DaysP5: number;
  doseUsvP95: number;
  causeCounts: Record<FailureCause | 'science_missed', number>;
  massUsed: number;
  worstSeed: number;
  rating: 'flight_ready' | 'needs_work';
}

export type SourceId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'S05'
  | 'S06'
  | 'S07'
  | 'S08'
  | 'S09'
  | 'S10'
  | 'S11'
  | 'ASSUMPTION'
  | 'DERIVED';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ParamEntry {
  value: number | number[];
  unit: string;
  source: SourceId;
  confidence: ConfidenceLevel;
  note: string;
}

export interface ParamsFile {
  version: string;
  params: Record<string, ParamEntry>;
}
