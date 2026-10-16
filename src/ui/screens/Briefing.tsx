// Briefing screen explaining the mission context and loop
// Spec B1, B4.10, Part C (L6)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';

export const BriefingScreen: React.FC = () => {
  const { dispatch } = useAppStore();

  return (
    <div className="panel-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '12px',
          color: 'var(--color-text-main)',
        }}
      >
        {copy.briefing.heading}
      </h2>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'var(--color-text-muted)',
          marginBottom: '28px',
        }}
      >
        {copy.briefing.summary}
      </p>

      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          marginBottom: '16px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
        }}
      >
        {copy.briefing.taskTitle}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
            {copy.briefing.step1Title}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {copy.briefing.step1Desc}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
            {copy.briefing.step2Title}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {copy.briefing.step2Desc}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
            {copy.briefing.step3Title}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {copy.briefing.step3Desc}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
            {copy.briefing.step4Title}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {copy.briefing.step4Desc}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'design' })}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontSize: '1.1rem',
            padding: '12px 28px',
            fontWeight: 600,
            border: 'none',
          }}
        >
          {copy.briefing.startButton}
        </button>
      </div>
    </div>
  );
};
