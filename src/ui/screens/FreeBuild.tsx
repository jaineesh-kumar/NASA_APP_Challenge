// Free build: the five-step mission flow (Briefing, Build, Rules, Test, Review), one step at a time.
// Each step puts its Back / Next buttons under its intro paragraph (StepHeader).
// The current step lives in the store (state.currentScreen); the page itself is #/free-build.

import React, { useEffect, useRef } from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { MissionBanner } from '../components/MissionBanner.tsx';
import { StepTrack } from '../components/StepTrack.tsx';
import { isStep, stepIndex, STEPS, StepId } from '../flow.ts';
import { BriefingScreen } from './Briefing.tsx';
import { DesignScreen } from './Design.tsx';
import { RehearseScreen } from './Rehearse.tsx';
import { ReviewScreen } from './Review.tsx';
import { RulesScreen } from './Rules.tsx';

const STEP_SCREENS: Record<StepId, React.FC> = {
  briefing: BriefingScreen,
  design: DesignScreen,
  rules: RulesScreen,
  rehearse: RehearseScreen,
  review: ReviewScreen,
};

export const FreeBuildScreen: React.FC = () => {
  const { state } = useAppStore();
  const step: StepId = isStep(state.currentScreen) ? state.currentScreen : 'briefing';
  const Screen = STEP_SCREENS[step];
  const idx = stepIndex(step);

  const furthest = Math.max(state.furthestStep, idx);

  // Each new step starts at its top, with focus on the page for screen readers.
  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0 });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [step]);

  return (
    <>
      <StepTrack current={step} furthest={furthest} />
      <MissionBanner step={step} />
      <article className="coupon" aria-label={copy.nav[step]}>
        <div className="coupon-strip">
          <span className="coupon-strip-step">{copy.flow.stepOf(idx + 1, STEPS.length)}</span>
          <span className="coupon-strip-code" aria-hidden="true">
            {copy.flow.stopCode(idx + 1)}
          </span>
        </div>
        <div className="coupon-body">
          <Screen />
        </div>
      </article>
    </>
  );
};
