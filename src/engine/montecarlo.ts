// Monte Carlo campaign, Wilson interval, nearest-rank percentile
// Spec B5.7

import { getSimConstants } from './constants.ts';
import { massUsed } from './mass.ts';
import { LoadedParams, loadParams } from './params.ts';
import { runMission } from './sim.ts';
import { CampaignResult, Design, FailureCause, Interval, MissionOptions, Rules } from './types.ts';

const Z95 = 1.96;

/** Spec B5.7 Wilson 95% interval for p = successes / n, clamped to [0, 1]. */
export function wilsonScoreInterval(successes: number, n: number): Interval {
  if (n <= 0) return { low: 0, high: 0 };
  const p = successes / n;
  const z2 = Z95 * Z95;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (Z95 * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { low: Math.max(0, centre - half), high: Math.min(1, centre + half) };
}

/** Spec B5.7 nearest-rank percentile on an ascending array: index ceil(q * n) - 1. */
export function percentile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1));
  return sorted[idx] ?? 0;
}

export function runCampaign(
  design: Design,
  rules: Rules,
  n?: number,
  paramsInput?: LoadedParams,
  onProgress?: (progress: number) => void,
  options: MissionOptions = {},
): CampaignResult {
  const params = paramsInput ?? loadParams();
  const k = getSimConstants(params);
  const runs = n !== undefined && n > 0 ? Math.floor(n) : k.campaignRuns;
  // Campaign runs never record a trace (that is only for the single replayed mission).
  const missionOptions: MissionOptions = { ...options, trace: false };

  const causeCounts: Record<FailureCause | 'science_missed', number> = {
    oxygen: 0,
    co2: 0,
    water: 0,
    food: 0,
    dose: 0,
    science_missed: 0,
  };
  const battery: number[] = [];
  const o2Days: number[] = [];
  const dose: number[] = [];
  let survivedCount = 0;
  let successCount = 0;
  let stormsTotal = 0;
  let stormsMax = 0;

  // Worst run (B5.7): earliest failure (ties: lowest seed); if none failed, lowest min battery.
  let worstFailSeed = -1;
  let worstFailHour = Infinity;
  let lowestBatterySeed = 1;
  let lowestBattery = Infinity;

  const step = Math.max(1, Math.floor(runs / 20));
  for (let seed = 1; seed <= runs; seed++) {
    const r = runMission(design, rules, seed, params, missionOptions);
    if (r.survived) {
      survivedCount++;
      if (r.scienceMet) successCount++;
      else causeCounts.science_missed++;
    } else if (r.failureCause) {
      causeCounts[r.failureCause]++;
      const h = r.failureHour ?? Infinity;
      if (h < worstFailHour) {
        worstFailHour = h;
        worstFailSeed = seed;
      }
    }
    if (r.minBatteryPct < lowestBattery) {
      lowestBattery = r.minBatteryPct;
      lowestBatterySeed = seed;
    }
    battery.push(r.minBatteryPct);
    o2Days.push(r.minO2Days);
    dose.push(r.peakDoseUsv);
    stormsTotal += r.storms.length;
    stormsMax = Math.max(stormsMax, r.storms.length);
    if (onProgress && (seed % step === 0 || seed === runs)) onProgress(seed / runs);
  }

  const asc = (a: number, b: number) => a - b;
  battery.sort(asc);
  o2Days.sort(asc);
  dose.sort(asc);

  const survivalRate = survivedCount / runs;
  const successRate = successCount / runs;
  return {
    runs,
    survivalRate,
    successRate,
    survivalCi: wilsonScoreInterval(survivedCount, runs),
    successCi: wilsonScoreInterval(successCount, runs),
    minBatteryPctP5: percentile(battery, 0.05),
    minO2DaysP5: percentile(o2Days, 0.05),
    doseUsvP95: percentile(dose, 0.95),
    causeCounts,
    massUsed: massUsed(design, params),
    worstSeed: worstFailSeed > 0 ? worstFailSeed : lowestBatterySeed,
    rating:
      survivalRate >= k.flightReadySurvival && successRate >= k.flightReadySuccess
        ? 'flight_ready'
        : 'needs_work',
    stormMode: options.stormMode ?? { kind: 'random' },
    stormsPerRunMean: stormsTotal / runs,
    stormsMaxInRun: stormsMax,
  };
}
