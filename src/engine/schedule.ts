// Schedule calculation for dark windows, jitter, and mast effects
// Spec B5.3, B5.4 (Step 3), B5.5

import { LoadedParams } from './params.ts';
import { SiteId } from './types.ts';

export interface DarkWindow {
  start: number;
  length: number;
  end: number;
}

/**
 * Computes the list of dark windows for a given site and mast level.
 * Spec B5.3 & B5.5:
 * - Base starts and lengths are loaded from site.<id>.dark_starts_h and site.<id>.dark_length_h.
 * - Jitter is drawn once before tick 0 per window in site order if rng is provided.
 * - Jitter is an integer in [-site.dark_jitter_h, +site.dark_jitter_h].
 * - Clamped so the window stays inside [0, mission.hours).
 * - Window length = floor(length * (1 - power.mast_dark_reduction_per_level * mastLevel)).
 */
export function computeDarkWindows(
  siteId: SiteId,
  mastLevel: 0 | 1 | 2 | 3,
  params: LoadedParams,
  rng?: () => number,
): DarkWindow[] {
  const missionHours = params.getNumber('mission.hours');
  const mastReductionPerLevel = params.getNumber('power.mast_dark_reduction_per_level');
  const baseStarts = params.getNumberArray(`site.${siteId}.dark_starts_h`);
  const baseLength = params.getNumber(`site.${siteId}.dark_length_h`);
  const maxJitter = params.getNumber('site.dark_jitter_h');

  // Spec B5.5: length = floor(length * (1 - mast_reduction * mastLevel))
  const reductionFactor = 1 - mastReductionPerLevel * mastLevel;
  const effectiveLength = Math.max(0, Math.floor(baseLength * reductionFactor));

  const windows: DarkWindow[] = [];
  const jitterSpan = maxJitter + maxJitter + 1;

  for (let i = 0; i < baseStarts.length; i++) {
    const rawStart = baseStarts[i] ?? 0;
    let jitter = 0;

    if (rng) {
      const u = rng();
      // Integer in [-maxJitter, +maxJitter]
      jitter = Math.floor(u * jitterSpan) - maxJitter;
    }

    const unclippedStart = rawStart + jitter;
    // Clamped so the window stays strictly inside [0, mission.hours)
    const maxStart = Math.max(0, missionHours - effectiveLength);
    const clampedStart = Math.max(0, Math.min(maxStart, unclippedStart));

    windows.push({
      start: clampedStart,
      length: effectiveLength,
      end: clampedStart + effectiveLength,
    });
  }

  return windows;
}

/**
 * Checks whether hour t is inside any dark window.
 * Spec B5.4 Step 3: sun = 0 inside a dark window [start, end), else 1.
 */
export function isHourInDarkWindow(t: number, windows: readonly DarkWindow[]): boolean {
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    if (w && t >= w.start && t < w.end) {
      return true;
    }
  }
  return false;
}
