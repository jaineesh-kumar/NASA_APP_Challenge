// Outpost Rules and Priority screen
// Spec B5.2, Part C (L6 AC4, AC5)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { PriorityLadder } from '../components/PriorityLadder.tsx';
import { RuleEditor } from '../components/RuleEditor.tsx';

export const RulesScreen: React.FC = () => {
  const { dispatch } = useAppStore();

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          {copy.rules.heading}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          {copy.rules.subheading}
        </p>
      </div>

      <div className="grid-2col">
        <div>
          <PriorityLadder />
        </div>
        <div>
          <RuleEditor />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'design' })}
          style={{ padding: '10px 20px' }}
        >
          {copy.rules.backButton}
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rehearse' })}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 24px',
            fontWeight: 600,
          }}
        >
          {copy.rules.nextButton}
        </button>
      </div>
    </div>
  );
};
