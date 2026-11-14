// Dark windows: base schedule, seeded jitter, mast effect
// Spec B5.3, B5.5

import { SimConstants } from './constants.ts';
import { SiteId } from './types.ts';

export interface DarkWindow {
  start: number;
  length: number;
  end: number; // exclusive
}

/**
 * Spec B5.5: each start shifts by an integer jitter in [-jitter, +jitter], clamped so the
 * window stays inside [0, mission.hours); length = floor(length * (1 - reduction * mastLevel)).
 * Spec B5.3: one jitter draw per window, in site order, before tick 0.
 */
export function computeDarkWindows(
  site: SiteId,
  mastLevel: 0 | 1 | 2 | 3,
  k: SimConstants,
  rng?: () => number,
): DarkWindow[] {
  const length = Math.max(
    0,
    Math.floor(k.darkLengthH[site] * (1 - k.mastDarkReductionPerLevel * mastLevel)),
  );
  const span = 2 * k.darkJitterH + 1;
  const maxStart = Math.max(0, k.missionHours - length);
  return k.darkStartsH[site].map((base) => {
    const jitter = rng ? Math.floor(rng() * span) - k.darkJitterH : 0;
    const start = Math.max(0, Math.min(maxStart, base + jitter));
    return { start, length, end: start + length };
  });
}

/** Hour-indexed lookup so the tick loop never scans the window list. */
export function buildDarkMask(windows: readonly DarkWindow[], missionHours: number): Uint8Array {
  const mask = new Uint8Array(missionHours);
  for (const w of windows) mask.fill(1, w.start, Math.min(missionHours, w.end));
  return mask;
}

export function isHourInDarkWindow(t: number, windows: readonly DarkWindow[]): boolean {
  return windows.some((w) => t >= w.start && t < w.end);
}

/** Hours until the next dark window starts (Infinity if none ahead). */
export function hoursUntilNextDark(t: number, windows: readonly DarkWindow[]): number {
  let best = Infinity;
  for (const w of windows) {
    const d = w.start - t;
    if (d > 0 && d < best) best = d;
  }
  return best;
}
