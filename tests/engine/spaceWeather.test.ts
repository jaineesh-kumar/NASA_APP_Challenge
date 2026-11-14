import { describe, expect, it } from 'vitest';
import raw from '../../data/spaceWeather.json' with { type: 'json' };
import {
  getSpaceWeather,
  loadSpaceWeather,
  pickSunWindow,
  windowStartDays,
} from '../../src/engine/spaceWeather.ts';
import { EngineError } from '../../src/engine/types.ts';
import { k } from './fixtures.ts';

describe('real DONKI space weather (ADR-005)', () => {
  const sw = getSpaceWeather();

  it('loads the archived snapshot with provenance', () => {
    expect(raw.source).toBe('S12');
    expect(sw.storms.length).toBe(raw.events.length);
    expect(sw.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (let i = 1; i < sw.storms.length; i++) {
      expect(sw.storms[i]?.onsetMs ?? 0).toBeGreaterThanOrEqual(sw.storms[i - 1]?.onsetMs ?? 0);
    }
  });

  it('quiet years really have fewer storms than stormy years', () => {
    const count = (y: number) => sw.years.find((x) => x.year === y)?.storms ?? -1;
    const maxQuiet = Math.max(...sw.quietYears.map(count));
    const minStormy = Math.min(...sw.stormyYears.map(count));
    expect(maxQuiet).toBeLessThanOrEqual(minStormy);
    expect(sw.quietYears.some((y) => sw.stormyYears.includes(y))).toBe(false);
  });

  it('a picked window contains exactly the DONKI storms inside it, never invented ones', () => {
    for (const u of [0, 0.13, 0.5, 0.77, 0.999]) {
      const w = pickSunWindow(sw, 'all', k.missionHours, u);
      const start = Date.parse(`${w.startDate}T00:00:00Z`);
      const end = start + k.missionHours * 3_600_000;
      const expected = sw.storms.filter((s) => s.onsetMs >= start && s.onsetMs < end);
      expect(w.storms.map((s) => s.id)).toEqual(expected.map((s) => s.id));
      for (const s of w.storms) {
        expect(s.onsetH).toBeGreaterThanOrEqual(0);
        expect(s.onsetH).toBeLessThan(k.missionHours);
        expect(s.warnH).toBe(Math.max(0, s.onsetH - s.leadH));
      }
    }
  });

  it('era windows start in the right years and fit inside the record', () => {
    for (const era of ['quiet', 'stormy'] as const) {
      const years = new Set(era === 'quiet' ? sw.quietYears : sw.stormyYears);
      const days = windowStartDays(sw, era, k.missionHours);
      expect(days.length).toBeGreaterThan(0);
      for (const d of days) expect(years.has(new Date(d).getUTCFullYear())).toBe(true);
    }
    const all = windowStartDays(sw, 'all', k.missionHours);
    const last = all[all.length - 1] ?? 0;
    expect(last + k.missionHours * 3_600_000).toBeLessThanOrEqual(
      Date.parse(`${sw.coverageEnd}T00:00:00Z`),
    );
  });

  it('rejects malformed data with EngineError', () => {
    expect(() => loadSpaceWeather({})).toThrow(EngineError);
    expect(() =>
      loadSpaceWeather({ ...raw, events: [{ onset: 'x', leadH: 1, id: 'a', link: 'b' }] }),
    ).toThrow(EngineError);
    expect(() =>
      loadSpaceWeather({
        ...raw,
        events: [{ onset: '2012-01-01T00:00Z', leadH: -1, id: 'a', link: 'b' }],
      }),
    ).toThrow(EngineError);
  });
});
