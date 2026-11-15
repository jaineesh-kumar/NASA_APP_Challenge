// Top of every mission step: the title, one short paragraph, then the step's main action (if any)
// and the Back / Next buttons, so the buttons are on screen without scrolling.

import React from 'react';
import { StepId } from '../flow.ts';
import { StepNav } from './StepNav.tsx';

export const StepHeader: React.FC<{
  step: StepId;
  title: string;
  lead: React.ReactNode;
  /** The step's main action, e.g. the Run test panel; shown between the paragraph and Next. */
  children?: React.ReactNode;
  /** A picture beside the text on wide screens. */
  media?: React.ReactNode;
}> = ({ step, title, lead, children, media }) => (
  <header className={`step-header${media ? ' has-media' : ''}`}>
    <div className="step-header-text">
      <h2 className="screen-title">{title}</h2>
      <p className="step-lead">{lead}</p>
      {children}
      <StepNav step={step} />
    </div>
    {media ? <div className="step-header-media">{media}</div> : null}
  </header>
);
