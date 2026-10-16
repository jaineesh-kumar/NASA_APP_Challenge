// Monte Carlo campaign execution and statistical aggregations
// Spec B5.7

import { massUsed } from './mass.ts';
import { LoadedParams, loadParams } from './params.ts';
import { runMission } from './sim.ts';
import { CampaignResult, Design, FailureCause, Interval, MissionResult, Rules } from './types.ts';

/**
 * Computes the Wilson score interval for a proportion at 95% confidence level.
 * Spec B5.7:
 * z = 1.95996 for 95% two-sided normal approximation.
 */
export function wilsonScoreInterval(successes: number, total: number): Interval {
  if (total <= 0) {
    return { low: 0, high: 0 };
  }

  const p = successes / total;
  const z = 1.95996;
  const zSquared = z * z;

  const denominator = 1 + zSquared / total;
  const center = (p + zSquared / (2 * total)) / denominator;
  const margin =
    (z / denominator) * Math.sqrt((p * (1 - p)) / total + zSquared / (4 * total * total));

  return {
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  };
}

/**
 * Computes the p-th percentile from a sorted array of numbers (0 <= p <= 1).
 */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))));
  return sorted[index] ?? 0;
}

/**
 * Executes a Monte Carlo campaign of N seeded missions (default 300).
 * Seeds run from 1 to N.
 * Spec B5.7.
 */
export function runCampaign(
  design: Design,
  rules: Rules,
  n = 300,
  paramsInput?: LoadedParams,
  onProgress?: (progress: number) => void,
): CampaignResult {
  const params = paramsInput ?? loadParams();
  const runsCount = n > 0 ? n : params.getNumber('campaign.runs');

  const results: MissionResult[] = [];
  let survivedCount = 0;
  let successCount = 0;

  const causeCounts: Record<FailureCause | 'science_missed', number> = {
    oxygen: 0,
    co2: 0,
    water: 0,
    food: 0,
    dose: 0,
    science_missed: 0,
  };

  const batteryPcts: number[] = [];
  const o2DaysList: number[] = [];
  const doseList: number[] = [];

  const progressInterval = Math.max(1, Math.floor(runsCount / 10));

  for (let seed = 1; seed <= runsCount; seed++) {
    const res = runMission(design, rules, seed, params);
    results.push(res);

    if (res.survived) {
      survivedCount++;
      if (res.scienceMet) {
        successCount++;
      } else {
        causeCounts.science_missed++;
      }
    } else if (res.failureCause) {
      causeCounts[res.failureCause]++;
    }

    batteryPcts.push(res.minBatteryPct);
    o2DaysList.push(res.minO2Days);
    doseList.push(res.peakDoseUsv);

    if (onProgress && (seed % progressInterval === 0 || seed === runsCount)) {
      onProgress(seed / runsCount);
    }
  }

  batteryPcts.sort((a, b) => a - b);
  o2DaysList.sort((a, b) => a - b);
  doseList.sort((a, b) => a - b);

  const survivalRate = survivedCount / runsCount;
  const successRate = successCount / runsCount;

  const survivalCi = wilsonScoreInterval(survivedCount, runsCount);
  const successCi = wilsonScoreInterval(successCount, runsCount);

  const minBatteryPctP5 = percentile(batteryPcts, 0.05);
  const minO2DaysP5 = percentile(o2DaysList, 0.05);
  const doseUsvP95 = percentile(doseList, 0.95);

  // Identify worst seed
  // Primary priority: failed missions (earliest failureHour, lowest minBatteryPct)
  // Secondary: surviving missions with missed science or lowest minBatteryPct
  let worstSeed = 1;
  let worstScore = Infinity;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r) continue;

    let score: number;
    if (!r.survived) {
      // Failed runs have score < 100000 based on failureHour
      score = (r.failureHour ?? 0) * 100 + r.minBatteryPct;
    } else if (!r.scienceMet) {
      score = 200000 + r.minBatteryPct;
    } else {
      score = 300000 + r.minBatteryPct;
    }

    if (score < worstScore) {
      worstScore = score;
      worstSeed = r.seed;
    }
  }

  const flightReadySurvival = params.getNumber('rating.flight_ready_survival');
  const flightReadySuccess = params.getNumber('rating.flight_ready_success');

  const rating =
    survivalRate >= flightReadySurvival && successRate >= flightReadySuccess
      ? 'flight_ready'
      : 'needs_work';

  const usedMass = massUsed(design, params);

  return {
    runs: runsCount,
    survivalRate,
    successRate,
    survivalCi,
    successCi,
    minBatteryPctP5,
    minO2DaysP5,
    doseUsvP95,
    causeCounts,
    massUsed: usedMass,
    worstSeed,
    rating,
  };
}
