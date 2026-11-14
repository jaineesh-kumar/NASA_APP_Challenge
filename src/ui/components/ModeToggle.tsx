// Junior / Planner toggle (B10.7): always visible in the header.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { PlayMode, useAppStore } from '../../state/store.tsx';

const MODES: readonly PlayMode[] = ['junior', 'planner'];

export const ModeToggle: React.FC = () => {
  const { state, dispatch } = useAppStore();
  return (
    <div className="mode-toggle" role="radiogroup" aria-label={copy.mode.label}>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={state.mode === m}
          title={m === 'junior' ? copy.mode.juniorHelp : copy.mode.plannerHelp}
          onClick={() => dispatch({ type: 'SET_MODE', mode: m })}
        >
          {copy.mode[m]}
        </button>
      ))}
    </div>
  );
};
