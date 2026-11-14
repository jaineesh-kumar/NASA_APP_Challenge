// Saves each fresh test of a guided mission to the Logbook progress (best result and goal).
// Renders nothing; it lives once inside the store provider.

import { useEffect } from 'react';
import { recordMissionTest } from '../../state/progress.ts';
import { useAppStore } from '../../state/store.tsx';
import { isGoalMet } from '../missionFlow.ts';

export function MissionRecorder(): null {
  const { state } = useAppStore();
  const id = state.mission?.id;
  const home = state.mission?.lastHome ?? null;
  useEffect(() => {
    if (id && home !== null) recordMissionTest(id, home, isGoalMet(home));
  }, [id, home]);
  return null;
}
