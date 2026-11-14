// Player progress for the Logbook: finished missions and Training Bay best scores.
// Only progress lives in localStorage (AGENTS F15). Every read and write is wrapped, so the game
// still works when storage is blocked (private windows, school browsers); progress then lasts
// for this visit only. Badges are worked out from progress, never stored.

import { useSyncExternalStore } from 'react';
import type { MissionId } from '../content/missions.ts';

export type TrainingId = 'power_juggle' | 'storm_shelter' | 'shield_stack';

export interface MissionProgress {
  /** Best crews home out of every 100 in any test of this mission. */
  bestHome: number | null;
  /** The best test reached the mission goal. */
  isGoalMet: boolean;
  /** All debrief questions answered. */
  isDebriefDone: boolean;
}

export interface TrainingProgress {
  plays: number;
  bestScore: number;
  /** The player reached the game's "well done" level at least once. */
  hasCleared: boolean;
}

export interface Progress {
  version: 1;
  missions: Partial<Record<MissionId, MissionProgress>>;
  training: Partial<Record<TrainingId, TrainingProgress>>;
}

export const PROGRESS_KEY = 'moonbase-margin:progress';
const EMPTY: Progress = { version: 1, missions: {}, training: {} };

const MISSION_IDS: readonly string[] = ['M1', 'M2', 'M3', 'M4', 'M5'];
const TRAINING_IDS: readonly string[] = ['power_juggle', 'storm_shelter', 'shield_stack'];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Keeps only well-formed entries; anything else (old or tampered data) is dropped. */
export function parseProgress(raw: string | null): Progress {
  if (raw === null) return EMPTY;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!isObj(data) || data['version'] !== 1) return EMPTY;
  const out: Progress = { version: 1, missions: {}, training: {} };
  const missions = data['missions'];
  if (isObj(missions)) {
    for (const [id, v] of Object.entries(missions)) {
      if (!MISSION_IDS.includes(id) || !isObj(v)) continue;
      const best = v['bestHome'];
      out.missions[id as MissionId] = {
        bestHome: typeof best === 'number' && best >= 0 && best <= 100 ? best : null,
        isGoalMet: v['isGoalMet'] === true,
        isDebriefDone: v['isDebriefDone'] === true,
      };
    }
  }
  const training = data['training'];
  if (isObj(training)) {
    for (const [id, v] of Object.entries(training)) {
      if (!TRAINING_IDS.includes(id) || !isObj(v)) continue;
      const plays = v['plays'];
      const best = v['bestScore'];
      out.training[id as TrainingId] = {
        plays: typeof plays === 'number' && plays >= 0 ? Math.floor(plays) : 0,
        bestScore: typeof best === 'number' && Number.isFinite(best) ? best : 0,
        hasCleared: v['hasCleared'] === true,
      };
    }
  }
  return out;
}

let current: Progress | null = null;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getProgress(): Progress {
  if (current === null) {
    let raw: string | null = null;
    try {
      raw = storage()?.getItem(PROGRESS_KEY) ?? null;
    } catch {
      raw = null;
    }
    current = parseProgress(raw);
  }
  return current;
}

function setProgress(next: Progress): void {
  current = next;
  try {
    storage()?.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep progress in memory for this visit.
  }
  listeners.forEach((l) => l());
}

const blankMission: MissionProgress = { bestHome: null, isGoalMet: false, isDebriefDone: false };

/** Records a test of a guided mission (keeps the best result). */
export function recordMissionTest(id: MissionId, home: number, isGoalMet: boolean): void {
  const p = getProgress();
  const was = p.missions[id] ?? blankMission;
  const bestHome = was.bestHome === null ? home : Math.max(was.bestHome, home);
  if (bestHome === was.bestHome && (was.isGoalMet || !isGoalMet)) return;
  setProgress({
    ...p,
    missions: { ...p.missions, [id]: { ...was, bestHome, isGoalMet: was.isGoalMet || isGoalMet } },
  });
}

export function recordDebriefDone(id: MissionId): void {
  const p = getProgress();
  const was = p.missions[id] ?? blankMission;
  if (was.isDebriefDone) return;
  setProgress({ ...p, missions: { ...p.missions, [id]: { ...was, isDebriefDone: true } } });
}

/** Records one finished round of a Training Bay game (higher score is better). */
export function recordTrainingRound(id: TrainingId, score: number, hasCleared: boolean): void {
  const p = getProgress();
  const was = p.training[id] ?? { plays: 0, bestScore: 0, hasCleared: false };
  setProgress({
    ...p,
    training: {
      ...p.training,
      [id]: {
        plays: was.plays + 1,
        bestScore: was.plays === 0 ? score : Math.max(was.bestScore, score),
        hasCleared: was.hasCleared || hasCleared,
      },
    },
  });
}

export function resetProgress(): void {
  try {
    storage()?.removeItem(PROGRESS_KEY);
  } catch {
    // Nothing stored, or storage blocked.
  }
  current = EMPTY;
  listeners.forEach((l) => l());
}

/** For tests: forget the in-memory copy so the next read comes from storage again. */
export function reloadProgressForTests(): void {
  current = null;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, () => EMPTY);
}
