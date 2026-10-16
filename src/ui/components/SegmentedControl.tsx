// Accessible SegmentedControl component
// Spec B4.9

import React from 'react';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  helpText?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  helpText,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
        {helpText && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {helpText}
          </div>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: '8px',
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              style={{
                backgroundColor: isSelected
                  ? 'var(--color-primary)'
                  : 'var(--color-bg-surface-elevated)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                color: isSelected ? '#ffffff' : 'var(--color-text-main)',
                padding: '10px 12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</span>
              {opt.sublabel && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)',
                  }}
                >
                  {opt.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
