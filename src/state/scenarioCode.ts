// URL Scenario Code Encoder and Decoder
// Spec Part C (L8 AC4, AC5)

import { Design, EngineError, IfThenRule, LoadId, Rules } from '../engine/types.ts';

export const SCENARIO_CODE_VERSION = 1;
const MAX_CODE_LENGTH = 2048;

interface ScenarioPayload {
  v: number;
  d: Design;
  r: Rules;
}

const VALID_SITES = new Set(['ridge', 'crater_edge']);
const VALID_LOADS = new Set([
  'life_support',
  'thermal',
  'comms',
  'greenhouse',
  'science',
  'construction',
]);
const VALID_CONDITIONS = new Set([
  'battery_below_pct',
  'spe_warning',
  'o2_days_below',
  'dark_window_within_h',
  'component_failed',
]);
const VALID_ACTIONS = new Set([
  'shed',
  'shelter',
  'repair_first',
  'greenhouse_low_power',
  'pause_science',
]);

function toBase64(str: string): string {
  return globalThis.btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64: string): string {
  return decodeURIComponent(escape(globalThis.atob(b64)));
}

/**
 * Encodes a Design and Rules configuration into a URL-safe scenario code string.
 * Format: "MM1-<base64_payload>"
 */
export function encodeScenarioCode(design: Design, rules: Rules): string {
  const payload: ScenarioPayload = {
    v: SCENARIO_CODE_VERSION,
    d: design,
    r: rules,
  };
  const json = JSON.stringify(payload);
  const encoded = toBase64(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `MM${SCENARIO_CODE_VERSION}-${encoded}`;
}

/**
 * Validates the decoded structure to ensure strict data integrity.
 */
function validateScenario(payload: unknown): { design: Design; rules: Rules } {
  if (typeof payload !== 'object' || payload === null) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Scenario payload must be an object.');
  }

  const p = payload as Record<string, unknown>;

  if (typeof p['v'] !== 'number' || p['v'] !== SCENARIO_CODE_VERSION) {
    throw new EngineError(
      'UNSUPPORTED_VERSION',
      `Unsupported scenario version: ${String(p['v'])}. Expected ${SCENARIO_CODE_VERSION}.`,
    );
  }

  const d = p['d'] as Record<string, unknown> | undefined;
  if (!d || typeof d !== 'object') {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Scenario is missing valid design object.');
  }

  if (typeof d['site'] !== 'string' || !VALID_SITES.has(d['site'])) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', `Invalid design site: ${String(d['site'])}`);
  }

  const design: Design = {
    site: d['site'] as 'ridge' | 'crater_edge',
    panels: Number(d['panels']),
    mastLevel: Number(d['mastLevel']) as 0 | 1 | 2 | 3,
    batteries: Number(d['batteries']),
    waterLoopTier: Number(d['waterLoopTier']) as 0 | 1,
    o2LoopTier: Number(d['o2LoopTier']) as 0 | 1,
    greenhouseModules: Number(d['greenhouseModules']) as 0 | 1 | 2 | 3,
    shieldingLayers: Number(d['shieldingLayers']) as 0 | 1 | 2 | 3,
    spares: d['spares'] as Design['spares'],
  };

  if (!Number.isInteger(design.panels) || design.panels < 1 || design.panels > 8) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Panels must be an integer between 1 and 8.');
  }
  if (![0, 1, 2, 3].includes(design.mastLevel)) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Mast level must be 0, 1, 2, or 3.');
  }
  if (!Number.isInteger(design.batteries) || design.batteries < 1 || design.batteries > 12) {
    throw new EngineError(
      'CORRUPT_SCENARIO_CODE',
      'Batteries must be an integer between 1 and 12.',
    );
  }
  if (![0, 1].includes(design.waterLoopTier)) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Water loop tier must be 0 or 1.');
  }
  if (![0, 1].includes(design.o2LoopTier)) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'O2 loop tier must be 0 or 1.');
  }
  if (![0, 1, 2, 3].includes(design.greenhouseModules)) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Greenhouse modules must be 0, 1, 2, or 3.');
  }
  if (![0, 1, 2, 3].includes(design.shieldingLayers)) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Shielding layers must be 0, 1, 2, or 3.');
  }
  if (!design.spares || typeof design.spares !== 'object') {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Design is missing spares object.');
  }

  const r = p['r'] as Record<string, unknown> | undefined;
  if (!r || typeof r !== 'object') {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Scenario is missing valid rules object.');
  }

  const priority = r['priority'] as LoadId[] | undefined;
  if (!Array.isArray(priority) || priority.length !== 6) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Priority ladder must contain exactly 6 loads.');
  }
  const seenLoads = new Set<string>();
  for (const load of priority) {
    if (!VALID_LOADS.has(load) || seenLoads.has(load)) {
      throw new EngineError(
        'CORRUPT_SCENARIO_CODE',
        `Invalid or duplicate load in priority ladder: ${load}`,
      );
    }
    seenLoads.add(load);
  }

  const ifThen = r['ifThen'] as IfThenRule[] | undefined;
  if (!Array.isArray(ifThen) || ifThen.length > 5) {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'IF-THEN rules list must contain 0 to 5 rules.');
  }

  for (const rule of ifThen) {
    if (!rule || !rule.condition || !rule.action) {
      throw new EngineError(
        'CORRUPT_SCENARIO_CODE',
        'Rule must contain both condition and action.',
      );
    }
    if (!VALID_CONDITIONS.has(rule.condition.kind)) {
      throw new EngineError(
        'CORRUPT_SCENARIO_CODE',
        `Invalid rule condition kind: ${rule.condition.kind}`,
      );
    }
    if (!VALID_ACTIONS.has(rule.action.kind)) {
      throw new EngineError(
        'CORRUPT_SCENARIO_CODE',
        `Invalid rule action kind: ${rule.action.kind}`,
      );
    }
  }

  return { design, rules: { priority, ifThen } };
}

/**
 * Decodes a scenario code string.
 * Rejects corrupt or oversized input with a clear EngineError message.
 */
export function decodeScenarioCode(code: string): { design: Design; rules: Rules } {
  if (typeof code !== 'string' || code.trim() === '') {
    throw new EngineError('INVALID_SCENARIO_CODE', 'Scenario code cannot be empty.');
  }

  if (code.length > MAX_CODE_LENGTH) {
    throw new EngineError(
      'OVERSIZED_SCENARIO_CODE',
      `Scenario code exceeds maximum allowed length of ${MAX_CODE_LENGTH} characters.`,
    );
  }

  const prefixMatch = code.match(/^MM(\d+)-(.*)$/);
  if (!prefixMatch) {
    throw new EngineError(
      'INVALID_SCENARIO_CODE',
      'Scenario code format invalid. Must begin with "MM<version>-" prefix.',
    );
  }

  const rawB64 = prefixMatch[2];
  if (!rawB64) {
    throw new EngineError('INVALID_SCENARIO_CODE', 'Scenario code payload is missing.');
  }

  // Restore base64 standard padding
  let b64 = rawB64.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }

  let jsonStr: string;
  try {
    jsonStr = fromBase64(b64);
  } catch {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Failed to decode base64 payload.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new EngineError('CORRUPT_SCENARIO_CODE', 'Scenario payload is not valid JSON.');
  }

  return validateScenario(parsed);
}
