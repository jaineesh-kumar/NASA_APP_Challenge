/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { copy } from './content/copy.ts';
import { AppStoreProvider, useAppStore } from './state/store.tsx';
import { ErrorBoundary } from './ui/components/ErrorBoundary.tsx';
import { Header } from './ui/components/Header.tsx';
import { Icon } from './ui/components/Icon.tsx';
import { StepFooter } from './ui/components/StepFooter.tsx';
import { StepTrack } from './ui/components/StepTrack.tsx';
import { isStep, stepIndex, STEPS } from './ui/flow.ts';
import { BriefingScreen } from './ui/screens/Briefing.tsx';
import { DesignScreen } from './ui/screens/Design.tsx';
import { LearnScreen } from './ui/screens/Learn.tsx';
import { ModelCardScreen } from './ui/screens/ModelCard.tsx';
import { RehearseScreen } from './ui/screens/Rehearse.tsx';
import { ReviewScreen } from './ui/screens/Review.tsx';
import { RulesScreen } from './ui/screens/Rules.tsx';

const SCREENS = {
  briefing: BriefingScreen,
  design: DesignScreen,
  rules: RulesScreen,
  rehearse: RehearseScreen,
  review: ReviewScreen,
  learn: LearnScreen,
  model_card: ModelCardScreen,
} as const;

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const screen = state.currentScreen;
  const step = isStep(screen) ? screen : null;
  const Screen = SCREENS[screen] ?? BriefingScreen;

  // Furthest step reached, for the Done stamps on the stubs.
  const [furthest, setFurthest] = useState(0);
  const idx = stepIndex(screen);
  if (idx > furthest) setFurthest(idx);

  // Each new page starts at its top, with focus on its heading for screen readers.
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [screen]);

  return (
    <div className="app-container">
      <a className="sr-only" href="#main-content">
        {copy.nav.label}
      </a>
      <Header />
      <StepTrack current={step} furthest={furthest} />
      <main className="main-content" id="main-content" ref={mainRef} tabIndex={-1}>
        {step ? (
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
        ) : (
          <>
            <button
              type="button"
              style={{ marginBottom: 16 }}
              onClick={() =>
                dispatch({
                  type: 'SET_SCREEN',
                  screen: STEPS[Math.min(furthest, STEPS.length - 1)] ?? 'briefing',
                })
              }
            >
              <Icon name="back" size={18} /> {copy.flow.backToMission}
            </button>
            <Screen />
          </>
        )}
      </main>
      {step ? <StepFooter step={step} /> : null}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppStoreProvider>
        <AppContent />
      </AppStoreProvider>
    </ErrorBoundary>
  );
}
