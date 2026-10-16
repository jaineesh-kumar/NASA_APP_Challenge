// Mass Budget progress bar with over-budget alerts and accessible cues
// Spec B4.9, Part C (L6 AC2)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { useAppStore } from '../../state/store.tsx';

const params = loadParams();
const maxBudget = params.getNumber('mass.budget'); // 120

export const MassBudgetBar: React.FC = () => {
  const { state } = useAppStore();
  const { massUsed, isWithinBudget } = state;

  const percentage = Math.min(100, Math.round((massUsed / maxBudget) * 100));
  const isOver = !isWithinBudget;

  const barColor = isOver ? 'var(--color-danger)' : 'var(--color-primary)';
  const statusColor = isOver ? 'var(--color-danger)' : 'var(--color-success)';

  return (
    <div
      className="panel-card"
      style={{
        padding: '16px 20px',
        marginBottom: '24px',
        borderColor: isOver ? 'var(--color-danger)' : 'var(--color-border)',
      }}
      role="region"
      aria-label="Launch Mass Budget Status"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{copy.design.budgetTitle}</span>
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: statusColor,
          }}
        >
          {massUsed} / {maxBudget} mu ({percentage}%)
        </span>
      </div>

      {/* Accessible progressbar bar */}
      <div
        role="progressbar"
        aria-valuenow={massUsed}
        aria-valuemin={0}
        aria-valuemax={maxBudget}
        aria-label="Launch mass used"
        style={{
          height: '12px',
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            transition: 'width 0.2s ease, background-color 0.2s ease',
          }}
        />
      </div>

      {/* Accessible status text (color is not the only signal, B4.9) */}
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: statusColor,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-live="polite"
      >
        {isOver ? (
          <>
            <span aria-hidden="true">⚠️</span>
            <span>{copy.design.overBudgetWarning}</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">✓</span>
            <span>{copy.design.withinBudgetSuccess}</span>
          </>
        )}
      </div>
    </div>
  );
};
