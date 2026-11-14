// Starting a guided mission and checking its goal. The goal number lives in data/params.json
// (missions.goal_home_per_100, an illustrative game choice).

import type React from 'react';
import { guidedMissions, GuidedMission } from '../content/missions.ts';
import { loadParams } from '../engine/params.ts';
import type { Action } from '../state/store.tsx';
import { navigate } from './router.ts';

export const MISSION_GOAL_HOME = loadParams().getNumber('missions.goal_home_per_100');

export function missionById(id: string | undefined): GuidedMission | undefined {
  return guidedMissions.find((m) => m.id === id);
}

export function isGoalMet(lastHome: number | null): boolean {
  return lastHome !== null && lastHome >= MISSION_GOAL_HOME;
}

/** Loads the mission's base and rules, opens its Build step and goes to the Free build page. */
export function startMission(dispatch: React.Dispatch<Action>, mission: GuidedMission): void {
  dispatch({ type: 'LOAD_MISSION', mission });
  dispatch({ type: 'SET_SCREEN', screen: 'design' });
  navigate('free-build');
}
