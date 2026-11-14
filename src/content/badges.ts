// Logbook badges: names and how to earn them. Earned badges are worked out from saved progress
// (src/state/progress.ts); badges themselves are never stored. Agent-drafted: needsReview.

import type { MissionId } from './missions.ts';
import type { Progress } from '../state/progress.ts';

export interface Badge {
  id: string;
  name: string;
  howTo: string;
  isEarned: (p: Progress) => boolean;
  needsReview: true;
}

const MISSIONS: readonly MissionId[] = ['M1', 'M2', 'M3', 'M4', 'M5'];
const goals = (p: Progress) => MISSIONS.filter((m) => p.missions[m]?.isGoalMet).length;
const debriefs = (p: Progress) => MISSIONS.filter((m) => p.missions[m]?.isDebriefDone).length;

export const badges: readonly Badge[] = [
  {
    id: 'first_test',
    name: 'First flight',
    howTo: 'Test any mission once.',
    isEarned: (p) => MISSIONS.some((m) => p.missions[m]?.bestHome != null),
    needsReview: true,
  },
  {
    id: 'first_debrief',
    name: 'Debrief done',
    howTo: 'Finish one mission debrief.',
    isEarned: (p) => debriefs(p) >= 1,
    needsReview: true,
  },
  {
    id: 'goal_getter',
    name: 'Goal getter',
    howTo: 'Reach the goal in three different missions.',
    isEarned: (p) => goals(p) >= 3,
    needsReview: true,
  },
  {
    id: 'all_missions',
    name: 'Mission commander',
    howTo: 'Finish all five mission debriefs.',
    isEarned: (p) => debriefs(p) === MISSIONS.length,
    needsReview: true,
  },
  {
    id: 'night_shift',
    name: 'Night shift',
    howTo: 'Get the base to sunrise in Power Juggle.',
    isEarned: (p) => p.training.power_juggle?.hasCleared === true,
    needsReview: true,
  },
  {
    id: 'storm_ready',
    name: 'Storm ready',
    howTo: 'Keep the crew in the shelter for a whole storm in Storm Shelter.',
    isEarned: (p) => p.training.storm_shelter?.hasCleared === true,
    needsReview: true,
  },
];
