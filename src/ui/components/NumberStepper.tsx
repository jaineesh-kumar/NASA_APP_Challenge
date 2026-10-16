// Accessible NumberStepper component
// Spec B4.9

import React from 'react';

interface NumberStepperProps {
  label: string;
  helpText?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unitLabel?: string;
  onChange: (val: number) => void;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  helpText,
  value,
  min,
  max,
  step = 1,
  unitLabel,
  onChange,
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + step);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ flex: 1, paddingRight: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
        {helpText && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {helpText}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          −
        </button>

        <span
          role="status"
          aria-label={`${label} count`}
          style={{
            minWidth: '40px',
            textAlign: 'center',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {value}
          {unitLabel ? ` ${unitLabel}` : ''}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};
