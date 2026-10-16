// Causal failure chain display and educational concept hint box
// Spec B1, B5.9, Part C (L7 AC6)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { buildCauseChain } from '../../engine/review.ts';
import { MissionResult } from '../../engine/types.ts';

interface ConceptHintBoxProps {
  worstResult: MissionResult;
}

export const ConceptHintBox: React.FC<ConceptHintBoxProps> = ({ worstResult }) => {
  const { chain, conceptHint } = buildCauseChain(worstResult);

  return (
    <div className="panel-card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
        {copy.review.causeChainTitle}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Root cause analysis traced backward from the failure event.
      </p>

      {chain.length === 0 ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            marginBottom: '16px',
          }}
        >
          No failure cascade occurred in this mission.
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {chain.map((link, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'var(--color-danger)',
                    minWidth: '24px',
                  }}
                >
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                  {link.effect}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  ← triggered by
                </span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 500, fontSize: '0.9rem' }}>
                  {link.causes.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Concept Hint Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          borderLeft: '4px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--color-primary-text)',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>💡</span>
          <span>{copy.review.conceptHintTitle}</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
          {conceptHint}
        </p>
      </div>
    </div>
  );
};
