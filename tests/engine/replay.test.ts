import { describe, expect, it } from 'vitest';
import archiveJson from '../../data/donki_archive.json' with { type: 'json' };
import replayGolden from '../golden/replay.json' with { type: 'json' };
import missionsGolden from '../golden/missions.json' with { type: 'json' };
import { runCampaign } from '../../src/engine/montecarlo.ts';
import { flareClassIndex, getDonkiArchive, loadDonkiArchive } from '../../src/engine/params.ts';
import { runMission } from '../../src/engine/sim.ts';
import { EngineError, MissionResult, StormMode } from '../../src/engine/types.ts';
import { goldenDesign, goldenRules, k, noRules, params } from './fixtures.ts';

const archive = getDonkiArchive();
const replayOf = (eventId: string): StormMode => ({ kind: 'replay', eventId });

describe('DONKI archive and Real Storm Replay (L10, Spec B5.11, B10.2)', () => {
  it('AC1: the archive records source, endpoint, query and retrievedAt for real events', () => {
    expect(archiveJson.source).toBe('S12');
    expect(archiveJson.endpoint).toMatch(/api\.nasa\.gov\/DONKI\/SEP/);
    expect(archiveJson.query.length).toBeGreaterThan(0);
    expect(archiveJson.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(archive.events.length).toBeGreaterThanOrEqual(1);
    expect(archive.events.length).toBeLessThanOrEqual(5);
    for (const e of archive.events) {
      expect(e.link).toMatch(/^https:\/\/ccmc\.gsfc\.nasa\.gov\/DONKI\/view\/SEP\//);
      expect(e.classEvidence.url).toMatch(/^https:\/\/ccmc\.gsfc\.nasa\.gov\/DONKI\//);
      expect(e.flareClass).toMatch(/^[CMX]\d/);
    }
  });

  it('AC2: the loader rejects malformed archives', () => {
    const good = structuredClone(archiveJson);
    const bad = (mutate: (a: Record<string, unknown>) => void) => {
      const a = structuredClone(good) as unknown as Record<string, unknown>;
      mutate(a);
      return () => loadDonkiArchive(a);
    };
    expect(() => loadDonkiArchive(good)).not.toThrow();
    expect(() => loadDonkiArchive(null)).toThrow(EngineError);
    expect(bad((a) => (a['source'] = 'S99'))).toThrow(/source/);
    expect(bad((a) => delete a['retrievedAt'])).toThrow(EngineError);
    expect(bad((a) => (a['retrievedAt'] = 'yesterday'))).toThrow(/ISO date/);
    expect(bad((a) => (a['events'] = []))).toThrow(EngineError);
    expect(bad((a) => (a['extra'] = 1))).toThrow(/unknown field/);
    const events = () =>
      (good.events as unknown[]).map((e) => structuredClone(e) as Record<string, unknown>);
    expect(bad((a) => (a['events'] = events().map((e) => ({ ...e, flareClass: 'B3.0' }))))).toThrow(
      /flare class/,
    );
    expect(bad((a) => (a['events'] = events().map((e) => ({ ...e, link: 'http://x' }))))).toThrow(
      /https/,
    );
    expect(bad((a) => (a['events'] = [...events(), ...events()]))).toThrow(EngineError);
  });

  it('flare class maps to the strength table (C=0, M=1, X=2) and rejects others', () => {
    expect(flareClassIndex('C3.1')).toBe(0);
    expect(flareClassIndex('M9.5')).toBe(1);
    expect(flareClassIndex('X4.0')).toBe(2);
    expect(() => flareClassIndex('B1.0')).toThrow(EngineError);
  });

  it('AC3: replay schedules exactly one SPE at radiation.replay_onset_h, deterministic per seed', () => {
    for (const e of archive.events) {
      for (const seed of [1, 7, 42]) {
        const a = runMission(goldenDesign, noRules, seed, params, {
          stormMode: replayOf(e.id),
          trace: true,
        });
        const b = runMission(goldenDesign, noRules, seed, params, {
          stormMode: replayOf(e.id),
          trace: true,
        });
        expect(a).toEqual(b);
        if (a.failureHour !== null && a.failureHour < k.replayOnsetH) continue;
        expect(a.storms.map((s) => s.onsetH)).toEqual([k.replayOnsetH]);
        expect(a.log.filter((l) => l.type === 'spe_start').map((l) => l.t)).toEqual([
          k.replayOnsetH,
        ]);
        const stormHours = (a.trace?.isStorm ?? []).filter(Boolean).length;
        const lastHour = (a.trace?.isStorm.length ?? 0) - 1;
        expect(stormHours).toBe(Math.min(k.speDurationH, lastHour - k.replayOnsetH + 1));
      }
    }
  });

  it('a stronger flare class means a bigger storm dose (same seed, no shelter)', () => {
    const byClass = (letter: string) => archive.events.find((e) => e.flareClass.startsWith(letter));
    const m = byClass('M');
    const x = byClass('X');
    if (!m || !x) return; // the archive does not contain both classes
    const dose = (id: string) =>
      runMission(goldenDesign, noRules, 3, params, { stormMode: replayOf(id) }).peakDoseUsv;
    expect(dose(x.id)).toBeGreaterThan(dose(m.id));
  });

  it('AC5: replay golden files match (every archived storm, seeds 1-3)', () => {
    const expected = replayGolden as Record<string, MissionResult[]>;
    expect(Object.keys(expected).sort()).toEqual(archive.events.map((e) => e.id).sort());
    for (const e of archive.events) {
      const actual = [1, 2, 3].map((s) =>
        runMission(goldenDesign, goldenRules, s, params, { stormMode: replayOf(e.id) }),
      );
      expect(actual, e.id).toEqual(expected[e.id]);
    }
  });

  it('AC4: random mode is unchanged (explicit random mode equals the default and the golden file)', () => {
    const golden = (missionsGolden as Record<string, MissionResult[]>)['ridge_balanced'];
    const actual = [1, 2, 3].map((s) =>
      runMission(goldenDesign, goldenRules, s, params, { stormMode: { kind: 'random' } }),
    );
    expect(actual).toEqual(golden);
  });

  it('unknown storm ids fail loudly; campaigns report their storm mode', () => {
    expect(() =>
      runMission(goldenDesign, goldenRules, 1, params, { stormMode: replayOf('nope-SEP-001') }),
    ).toThrow(/No archived storm/);
    const first = archive.events[0];
    if (!first) throw new Error('archive is empty');
    const c = runCampaign(goldenDesign, goldenRules, 10, params, undefined, {
      stormMode: replayOf(first.id),
    });
    expect(c.stormMode).toEqual(replayOf(first.id));
    expect(c.stormsMaxInRun).toBeLessThanOrEqual(1);
  });
});
