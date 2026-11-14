// Sticky pager under every step: Back, a plain-words reason when Next is locked, Next.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { nextOf, STEPS, StepId } from '../flow.ts';
import { Icon } from './Icon.tsx';

export const StepFooter: React.FC<{ step: StepId }> = ({ step }) => {
  const { state, dispatch } = useAppStore();
  const i = STEPS.indexOf(step);
  const prev = i > 0 ? STEPS[i - 1] : undefined;
  const { target, reason } = nextOf(step, state);
  const reasonId = `next-reason-${step}`;

  return (
    <div className="step-footer">
      <div className="step-footer-inner">
        {prev ? (
          <button type="button" onClick={() => dispatch({ type: 'SET_SCREEN', screen: prev })}>
            <Icon name="back" size={18} /> {copy.flow.back}
          </button>
        ) : (
          <span />
        )}
        <p className="step-footer-reason" id={reasonId} aria-live="polite">
          {reason}
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={reason !== null}
          aria-describedby={reason ? reasonId : undefined}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: target })}
        >
          {copy.flow.next[step]} <Icon name={step === 'review' ? 'retry' : 'next'} size={18} />
        </button>
      </div>
    </div>
  );
};
