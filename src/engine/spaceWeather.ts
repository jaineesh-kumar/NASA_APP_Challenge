// Real solar particle storms from NASA DONKI (source S12), replayed on the mission clock.
// Spec ADR-005. The data is an archived snapshot made by scripts/fetch-nasa-data.mjs; it is
// never presented as live. No network access happens here (F10).

import spaceWeatherJson from '../../data/spaceWeather.json' with { type: 'json' };
import { EngineError, SunEra } from './types.ts';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export interface DonkiStorm {
  onsetMs: number;
  onset: string;
  leadH: number;
  id: string;
  link: string;
}

export interface YearCount {
  year: number;
  storms: number;
}

export interface SpaceWeatherRecord {
  fetchedAt: string;
  coverageStart: string;
  coverageEnd: string;
  rawEntries: number;
  storms: readonly DonkiStorm[];
  /** Storms per full calendar year inside the coverage. */
  years: readonly YearCount[];
  quietYears: readonly number[];
  stormyYears: readonly number[];
  /** Median forecast lead in hours across all storms. */
  medianLeadH: number;
  noWarningShare: number;
}

/** A storm placed on the mission clock (hours from mission start). */
export interface ScheduledStorm {
  onsetH: number;
  leadH: number;
  warnH: number; // hour the forecast is issued on Earth
  id: string;
  link: string;
}

export interface PickedWindow {
  startDate: string;
  storms: ScheduledStorm[];
}

function fail(msg: string): never {
  throw new EngineError('INVALID_SPACE_WEATHER', msg);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  if (typeof v !== 'string' || v === '') fail(`'${key}' must be a non-empty string.`);
  return v;
}

function parseDay(s: string): number {
  const ms = Date.parse(`${s}T00:00:00Z`);
  if (Number.isNaN(ms)) fail(`Bad date '${s}'.`);
  return ms;
}

export function loadSpaceWeather(raw: unknown = spaceWeatherJson): SpaceWeatherRecord {
  if (!isRecord(raw)) fail('Root must be an object.');
  const coverage = raw['coverage'];
  if (!isRecord(coverage)) fail("'coverage' must be an object.");
  const coverageStart = str(coverage, 'start');
  const coverageEnd = str(coverage, 'end');
  const startMs = parseDay(coverageStart);
  const endMs = parseDay(coverageEnd);
  if (endMs <= startMs) fail('Coverage end must be after start.');

  const eventsRaw = raw['events'];
  if (!Array.isArray(eventsRaw)) fail("'events' must be an array.");
  const storms: DonkiStorm[] = eventsRaw.map((e, i) => {
    if (!isRecord(e)) fail(`Event ${i} must be an object.`);
    const onset = str(e, 'onset');
    const onsetMs = Date.parse(onset);
    if (Number.isNaN(onsetMs)) fail(`Event ${i} has a bad onset '${onset}'.`);
    const leadH = e['leadH'];
    if (typeof leadH !== 'number' || !Number.isInteger(leadH) || leadH < 0) {
      fail(`Event ${i} leadH must be a non-negative integer.`);
    }
    return { onsetMs, onset, leadH, id: str(e, 'id'), link: str(e, 'link') };
  });
  storms.sort((a, b) => a.onsetMs - b.onsetMs);

  // Only full calendar years count toward the quiet / stormy split, so a partial year at
  // either end of the record cannot look artificially quiet.
  const firstFullYear =
    new Date(startMs).getUTCFullYear() + (coverageStart.endsWith('-01-01') ? 0 : 1);
  const lastFullYear = new Date(endMs).getUTCFullYear() - (coverageEnd.endsWith('-12-31') ? 0 : 1);
  const years: YearCount[] = [];
  for (let y = firstFullYear; y <= lastFullYear; y++) {
    years.push({
      year: y,
      storms: storms.filter((s) => new Date(s.onsetMs).getUTCFullYear() === y).length,
    });
  }
  if (years.length < 3) fail('Need at least 3 full years of data to define eras.');
  const third = Math.max(1, Math.floor(years.length / 3));
  const ranked = [...years].sort((a, b) => a.storms - b.storms || a.year - b.year);
  const quietYears = ranked
    .slice(0, third)
    .map((y) => y.year)
    .sort((a, b) => a - b);
  const stormyYears = ranked
    .slice(-third)
    .map((y) => y.year)
    .sort((a, b) => a - b);

  const leads = storms.map((s) => s.leadH).sort((a, b) => a - b);
  const medianLeadH = leads.length > 0 ? (leads[Math.floor((leads.length - 1) / 2)] ?? 0) : 0;
  const noWarningShare = leads.length > 0 ? leads.filter((l) => l === 0).length / leads.length : 0;

  return {
    fetchedAt: str(raw, 'fetchedAt'),
    coverageStart,
    coverageEnd,
    rawEntries: typeof raw['rawEntries'] === 'number' ? raw['rawEntries'] : storms.length,
    storms,
    years,
    quietYears,
    stormyYears,
    medianLeadH,
    noWarningShare,
  };
}

let defaultRecord: SpaceWeatherRecord | null = null;
export function getSpaceWeather(): SpaceWeatherRecord {
  defaultRecord ??= loadSpaceWeather();
  return defaultRecord;
}

const startDayCache = new WeakMap<SpaceWeatherRecord, Map<string, Float64Array>>();

/** All valid window start days (ms) for an era: whole window inside the record. */
export function windowStartDays(
  record: SpaceWeatherRecord,
  era: SunEra,
  missionHours: number,
): Float64Array {
  let perRecord = startDayCache.get(record);
  if (!perRecord) {
    perRecord = new Map();
    startDayCache.set(record, perRecord);
  }
  const key = `${era}:${missionHours}`;
  const hit = perRecord.get(key);
  if (hit) return hit;

  const allowed: ReadonlySet<number> | null =
    era === 'quiet'
      ? new Set(record.quietYears)
      : era === 'stormy'
        ? new Set(record.stormyYears)
        : null;
  const first = parseDay(record.coverageStart);
  const lastStart = parseDay(record.coverageEnd) - missionHours * HOUR_MS;
  const days: number[] = [];
  for (let d = first; d <= lastStart; d += DAY_MS) {
    if (allowed === null || allowed.has(new Date(d).getUTCFullYear())) days.push(d);
  }
  if (days.length === 0) fail(`No ${era} windows fit inside the record.`);
  const arr = Float64Array.from(days);
  perRecord.set(key, arr);
  return arr;
}

/** First index with onsetMs >= ms (storms are sorted). */
function lowerBound(storms: readonly DonkiStorm[], ms: number): number {
  let lo = 0;
  let hi = storms.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((storms[mid]?.onsetMs ?? Infinity) < ms) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Picks one real 30-day stretch of solar history with a single draw u in [0, 1).
 * ADR-005: replaces the invented per-tick SPE draw of B5.5.
 */
export function pickSunWindow(
  record: SpaceWeatherRecord,
  era: SunEra,
  missionHours: number,
  u: number,
): PickedWindow {
  const days = windowStartDays(record, era, missionHours);
  const startMs = days[Math.min(days.length - 1, Math.floor(u * days.length))] ?? days[0] ?? 0;
  const endMs = startMs + missionHours * HOUR_MS;
  const storms: ScheduledStorm[] = [];
  for (let i = lowerBound(record.storms, startMs); i < record.storms.length; i++) {
    const s = record.storms[i];
    if (!s || s.onsetMs >= endMs) break;
    const onsetH = Math.floor((s.onsetMs - startMs) / HOUR_MS);
    storms.push({
      onsetH,
      leadH: s.leadH,
      // A forecast issued before the mission started is already waiting at hour 0.
      warnH: Math.max(0, onsetH - s.leadH),
      id: s.id,
      link: s.link,
    });
  }
  return { startDate: new Date(startMs).toISOString().slice(0, 10), storms };
}
