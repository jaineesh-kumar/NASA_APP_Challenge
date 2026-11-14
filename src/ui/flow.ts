// Step-by-step flow: which screen is which step, and when a step may be entered.

import { copy } from '../content/copy.ts';
import { AppState, ScreenId } from '../state/store.tsx';

export type StepId = 'briefing' | 'design' | 'rules' | 'rehearse' | 'review';

export const STEPS: readonly StepId[] = ['briefing', 'design', 'rules', 'rehearse', 'review'];

export function stepIndex(screen: ScreenId): number {
  return STEPS.indexOf(screen as StepId);
}

export function isStep(screen: ScreenId): screen is StepId {
  return stepIndex(screen) >= 0;
}

/** Why a step cannot be entered yet, in kid words; null when it is open. */
export function lockReason(step: StepId, state: AppState): string | null {
  const i = STEPS.indexOf(step);
  if (i >= STEPS.indexOf('rules') && !state.isWithinBudget) return copy.flow.locked.overBudget;
  if (step === 'review') {
    if (state.isRunningCampaign) return copy.flow.locked.running;
    if (!state.campaignResult) return copy.flow.locked.noResult;
  }
  return null;
}

/** Where Next goes from a step, and why it is locked (if it is). */
export function nextOf(step: StepId, state: AppState): { target: StepId; reason: string | null } {
  if (step === 'review') return { target: 'design', reason: null };
  const target = STEPS[STEPS.indexOf(step) + 1] ?? 'review';
  return { target, reason: lockReason(target, state) };
}

/** A step is stamped Done once the player has moved past it (Test also needs a fresh result). */
export function isStepDone(step: StepId, state: AppState, furthest: number): boolean {
  const i = STEPS.indexOf(step);
  if (step === 'rehearse') return state.campaignResult !== null && !state.isResultStale;
  if (step === 'review') return false;
  return i < furthest;
}
