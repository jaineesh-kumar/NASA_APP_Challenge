// PriorityLadder component for ordering load shedding priority
// Spec B5.2, Part C (L6 AC4)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { LoadId } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';

export const PriorityLadder: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { priority } = state.rules;

  return (
    <div className="panel-card" style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '6px' }}>
        {copy.rules.priorityTitle}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        {copy.rules.priorityHelp}
      </p>

      <ol
        aria-label="Power load priority ladder"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {priority.map((loadId: LoadId, index: number) => {
          const isTop = index === 0;
          const isBottom = index === priority.length - 1;
          const loadName = copy.loads[loadId] ?? loadId;

          return (
            <li
              key={loadId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: isTop
                      ? 'var(--color-success)'
                      : isBottom
                        ? 'var(--color-danger)'
                        : 'var(--color-text-muted)',
                    minWidth: '24px',
                  }}
                >
                  #{index + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{loadName}</span>
                {isTop && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      fontWeight: 600,
                    }}
                  >
                    Protected (Shed Last)
                  </span>
                )}
                {isBottom && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-danger-bg)',
                      color: 'var(--color-danger)',
                      fontWeight: 600,
                    }}
                  >
                    Shed First
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'MOVE_PRIORITY', index, direction: 'up' })}
                  disabled={isTop}
                  aria-label={`Move up ${loadName}`}
                  style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                >
                  ▲ {copy.rules.priorityMoveUp}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'MOVE_PRIORITY', index, direction: 'down' })}
                  disabled={isBottom}
                  aria-label={`Move down ${loadName}`}
                  style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                >
                  ▼ {copy.rules.priorityMoveDown}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
