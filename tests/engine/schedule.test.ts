import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/engine/rng.ts';
import {
  buildDarkMask,
  computeDarkWindows,
  hoursUntilNextDark,
  isHourInDarkWindow,
} from '../../src/engine/schedule.ts';
import { k } from './fixtures.ts';

const total = (ws: { length: number }[]) => ws.reduce((s, w) => s + w.length, 0);

describe('dark windows (L2 AC1-AC3, AC8)', () => {
  it('AC1: before jitter, ridge is dark 10% and crater edge 30% of the mission', () => {
    expect(total(computeDarkWindows('ridge', 0, k)) / k.missionHours).toBeCloseTo(0.1, 10);
    expect(total(computeDarkWindows('crater_edge', 0, k)) / k.missionHours).toBeCloseTo(0.3, 10);
  });

  it('AC2: jittered windows stay inside the mission and repeat per seed', () => {
    for (let seed = 1; seed <= 200; seed++) {
      for (const site of ['ridge', 'crater_edge'] as const) {
        const a = computeDarkWindows(site, 0, k, mulberry32(seed));
        const b = computeDarkWindows(site, 0, k, mulberry32(seed));
        expect(a).toEqual(b);
        for (const w of a) {
          expect(w.start).toBeGreaterThanOrEqual(0);
          expect(w.end).toBeLessThanOrEqual(k.missionHours);
          expect(Number.isInteger(w.start)).toBe(true);
        }
      }
    }
  });

  it('AC3: a higher mast never lengthens a window', () => {
    for (const site of ['ridge', 'crater_edge'] as const) {
      const lens = ([0, 1, 2, 3] as const).map(
        (m) => computeDarkWindows(site, m, k)[0]?.length ?? 0,
      );
      for (let i = 1; i < lens.length; i++) expect(lens[i]).toBeLessThanOrEqual(lens[i - 1] ?? 0);
    }
  });

  it('mask and helpers agree with the window list', () => {
    const ws = computeDarkWindows('crater_edge', 1, k, mulberry32(7));
    const mask = buildDarkMask(ws, k.missionHours);
    for (let t = 0; t < k.missionHours; t++) {
      expect(mask[t] === 1).toBe(isHourInDarkWindow(t, ws));
    }
    const first = ws[0];
    if (first && first.start > 5) expect(hoursUntilNextDark(first.start - 5, ws)).toBe(5);
  });
});
