import { describe, expect, it } from 'vitest';
import { loadParams } from '../../src/engine/params.ts';
import { mulberry32 } from '../../src/engine/rng.ts';
import { computeDarkWindows, isHourInDarkWindow } from '../../src/engine/schedule.ts';

describe('schedule calculations (Spec B5.3, B5.5, AC1, AC2, AC3)', () => {
  const params = loadParams();
  const missionHours = params.getNumber('mission.hours'); // 720

  it('ridge windows total 10% and crater-edge 30% of mission hours before jitter (AC1)', () => {
    // Ridge: 2 windows of 36h each = 72h / 720h = 10%
    const ridgeWindows = computeDarkWindows('ridge', 0, params);
    const ridgeTotalDarkHours = ridgeWindows.reduce((acc, w) => acc + w.length, 0);
    expect(ridgeTotalDarkHours).toBe(72);
    expect(ridgeTotalDarkHours / missionHours).toBeCloseTo(0.1, 5);

    // Crater edge: 3 windows of 72h each = 216h / 720h = 30%
    const craterWindows = computeDarkWindows('crater_edge', 0, params);
    const craterTotalDarkHours = craterWindows.reduce((acc, w) => acc + w.length, 0);
    expect(craterTotalDarkHours).toBe(216);
    expect(craterTotalDarkHours / missionHours).toBeCloseTo(0.3, 5);
  });

  it('jittered windows stay inside the mission and are reproducible per seed (AC2)', () => {
    const testSeeds = [1, 2, 42, 100, 999, 12345];

    for (const seed of testSeeds) {
      const rng1 = mulberry32(seed);
      const windows1 = computeDarkWindows('ridge', 0, params, rng1);

      const rng2 = mulberry32(seed);
      const windows2 = computeDarkWindows('ridge', 0, params, rng2);

      // Reproducibility
      expect(windows1).toEqual(windows2);

      // Boundary check: strictly inside [0, missionHours)
      for (const w of windows1) {
        expect(w.start).toBeGreaterThanOrEqual(0);
        expect(w.length).toBeGreaterThan(0);
        expect(w.end).toBeLessThanOrEqual(missionHours);
      }
    }

    // Crater edge boundary checks with jitter
    for (const seed of testSeeds) {
      const rng = mulberry32(seed);
      const windows = computeDarkWindows('crater_edge', 1, params, rng);
      for (const w of windows) {
        expect(w.start).toBeGreaterThanOrEqual(0);
        expect(w.length).toBeGreaterThan(0);
        expect(w.end).toBeLessThanOrEqual(missionHours);
      }
    }
  });

  it('higher mastLevel never lengthens a window (AC3)', () => {
    const mastLevels: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3];

    for (const site of ['ridge', 'crater_edge'] as const) {
      let previousLength = Infinity;
      for (const mast of mastLevels) {
        const windows = computeDarkWindows(site, mast, params);
        for (const w of windows) {
          expect(w.length).toBeLessThanOrEqual(previousLength);
        }
        previousLength = windows[0]?.length ?? 0;
      }
    }
  });

  it('isHourInDarkWindow accurately checks if an hour is dark', () => {
    const windows = [
      { start: 100, length: 20, end: 120 },
      { start: 300, length: 15, end: 315 },
    ];

    expect(isHourInDarkWindow(99, windows)).toBe(false);
    expect(isHourInDarkWindow(100, windows)).toBe(true);
    expect(isHourInDarkWindow(110, windows)).toBe(true);
    expect(isHourInDarkWindow(119, windows)).toBe(true);
    expect(isHourInDarkWindow(120, windows)).toBe(false);

    expect(isHourInDarkWindow(300, windows)).toBe(true);
    expect(isHourInDarkWindow(314, windows)).toBe(true);
    expect(isHourInDarkWindow(315, windows)).toBe(false);
  });
});
