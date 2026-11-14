// Shareable scenario codes: encode / decode design + rules + sun era (L8 AC4, AC5)
// Format "MM<version>-<base64url JSON>". v2 adds the sun era (ADR-005); v1 codes still load.

import { LOAD_IDS } from '../engine/constants.ts';
import { validateRules } from '../engine/rules.ts';
import {
  Action,
  ComponentId,
  Condition,
  Design,
  EngineError,
  IfThenRule,
  LoadId,
  Rules,
  SiteId,
  SunEra,
} from '../engine/types.ts';

export const SCENARIO_CODE_VERSION = 2;
const SUPPORTED_VERSIONS: ReadonlySet<number> = new Set([1, 2]);
const MAX_CODE_LENGTH = 2048;

export interface Scenario {
  design: Design;
  rules: Rules;
  sunEra: SunEra;
}

const SITES: ReadonlySet<string> = new Set<SiteId>(['ridge', 'crater_edge']);
const ERAS: ReadonlySet<string> = new Set<SunEra>(['all', 'quiet', 'stormy']);
const LOADS: ReadonlySet<string> = new Set<string>(LOAD_IDS);
const COMPONENTS: readonly ComponentId[] = [
  'co2_scrubber',
  'o2_generator',
  'water_processor',
  'power_array',
];
const VALUE_CONDITIONS: ReadonlySet<string> = new Set([
  'battery_below_pct',
  'o2_days_below',
  'dark_window_within_h',
]);
const FLAG_CONDITIONS: ReadonlySet<string> = new Set(['spe_warning', 'component_failed']);
const FLAG_ACTIONS: ReadonlySet<string> = new Set([
  'shelter',
  'repair_first',
  'greenhouse_low_power',
  'pause_science',
]);
// Rule thresholds are percentages, days or hours; anything outside this range is corrupt input.
const MAX_RULE_VALUE = 1000;

function corrupt(msg: string): never {
  throw new EngineError('CORRUPT_SCENARIO_CODE', msg);
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function intIn(v: unknown, lo: number, hi: number, what: string): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < lo || v > hi) {
    corrupt(`${what} must be an integer between ${lo} and ${hi}.`);
  }
  return v;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return globalThis.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const bin = globalThis.atob(b64);
  return new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(bin, (c) => c.charCodeAt(0)),
  );
}

export function encodeScenarioCode(design: Design, rules: Rules, sunEra: SunEra = 'all'): string {
  const json = JSON.stringify({ v: SCENARIO_CODE_VERSION, d: design, r: rules, e: sunEra });
  return `MM${SCENARIO_CODE_VERSION}-${toBase64Url(json)}`;
}

function parseDesign(d: unknown): Design {
  if (!isObj(d)) corrupt('Scenario is missing a valid design.');
  if (typeof d['site'] !== 'string' || !SITES.has(d['site']))
    corrupt(`Invalid site: ${String(d['site'])}`);
  const spares = d['spares'];
  if (!isObj(spares)) corrupt('Design is missing spares.');
  return {
    site: d['site'] as SiteId,
    panels: intIn(d['panels'], 1, 8, 'Panels'),
    mastLevel: intIn(d['mastLevel'], 0, 3, 'Mast level') as Design['mastLevel'],
    batteries: intIn(d['batteries'], 1, 12, 'Batteries'),
    waterLoopTier: intIn(d['waterLoopTier'], 0, 1, 'Water loop tier') as Design['waterLoopTier'],
    o2LoopTier: intIn(d['o2LoopTier'], 0, 1, 'O2 loop tier') as Design['o2LoopTier'],
    greenhouseModules: intIn(
      d['greenhouseModules'],
      0,
      3,
      'Greenhouse modules',
    ) as Design['greenhouseModules'],
    shieldingLayers: intIn(
      d['shieldingLayers'],
      0,
      3,
      'Shielding layers',
    ) as Design['shieldingLayers'],
    spares: Object.fromEntries(
      COMPONENTS.map((id) => [id, intIn(spares[id], 0, 2, `Spares for ${id}`)]),
    ) as Design['spares'],
  };
}

function parseCondition(c: unknown): Condition {
  if (!isObj(c) || typeof c['kind'] !== 'string') corrupt('Rule condition is missing.');
  const kind = c['kind'];
  if (FLAG_CONDITIONS.has(kind)) return { kind } as Condition;
  if (VALUE_CONDITIONS.has(kind)) {
    const v = c['value'];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > MAX_RULE_VALUE) {
      corrupt(`Rule value for ${kind} must be a number between 0 and ${MAX_RULE_VALUE}.`);
    }
    return { kind, value: v } as Condition;
  }
  return corrupt(`Invalid rule condition kind: ${kind}`);
}

function parseAction(a: unknown): Action {
  if (!isObj(a) || typeof a['kind'] !== 'string') corrupt('Rule action is missing.');
  const kind = a['kind'];
  if (FLAG_ACTIONS.has(kind)) return { kind } as Action;
  if (kind === 'shed') {
    if (typeof a['load'] !== 'string' || !LOADS.has(a['load']))
      corrupt(`Invalid load to switch off: ${String(a['load'])}`);
    return { kind: 'shed', load: a['load'] as LoadId };
  }
  return corrupt(`Invalid rule action kind: ${kind}`);
}

function parseRules(r: unknown): Rules {
  if (!isObj(r)) corrupt('Scenario is missing valid rules.');
  const priority = r['priority'];
  const ifThen = r['ifThen'];
  if (!Array.isArray(priority) || !priority.every((l) => typeof l === 'string' && LOADS.has(l))) {
    corrupt('Priority ladder must list the 6 loads.');
  }
  if (!Array.isArray(ifThen)) corrupt('IF-THEN rules must be a list.');
  const rules: Rules = {
    priority: priority as LoadId[],
    ifThen: ifThen.map((rule): IfThenRule => {
      if (!isObj(rule)) corrupt('Each rule needs a condition and an action.');
      return { condition: parseCondition(rule['condition']), action: parseAction(rule['action']) };
    }),
  };
  try {
    validateRules(rules); // permutation + max rule count, same check the engine uses
  } catch (err) {
    corrupt(err instanceof Error ? err.message : String(err));
  }
  return rules;
}

export function decodeScenarioCode(code: string): Scenario {
  if (typeof code !== 'string' || code.trim() === '') {
    throw new EngineError('INVALID_SCENARIO_CODE', 'Scenario code cannot be empty.');
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new EngineError(
      'OVERSIZED_SCENARIO_CODE',
      `Scenario code is longer than ${MAX_CODE_LENGTH} characters.`,
    );
  }
  const match = /^MM(\d+)-([A-Za-z0-9_-]+)$/.exec(code.trim());
  if (!match || match[2] === undefined) {
    throw new EngineError('INVALID_SCENARIO_CODE', 'Scenario code must look like "MM2-..."');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(match[2]));
  } catch {
    corrupt('Scenario code is damaged and could not be read.');
  }
  if (!isObj(parsed)) corrupt('Scenario payload must be an object.');
  const v = parsed['v'];
  if (typeof v !== 'number' || !SUPPORTED_VERSIONS.has(v) || String(v) !== match[1]) {
    throw new EngineError('UNSUPPORTED_VERSION', `Unsupported scenario version: ${String(v)}.`);
  }
  const e = parsed['e'];
  const sunEra: SunEra = v >= 2 && typeof e === 'string' && ERAS.has(e) ? (e as SunEra) : 'all';
  if (v >= 2 && (typeof e !== 'string' || !ERAS.has(e))) corrupt(`Invalid sun era: ${String(e)}`);
  return { design: parseDesign(parsed['d']), rules: parseRules(parsed['r']), sunEra };
}
