// Accessible NumberStepper component
// Spec B4.9

import React from 'react';
import { Icon } from './Icon.tsx';

interface NumberStepperProps {
  label: string;
  helpText?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unitLabel?: string;
  /** False when one more would break the mass budget (Spec B8: "+" disabled over budget). */
  canIncrement?: boolean;
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
  canIncrement = true,
  onChange,
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value < max && canIncrement) onChange(value + step);
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
            width: '44px',
            height: '44px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          <Icon name="minus" size={18} />
        </button>

        <span
          role="status"
          aria-label={`${label} count`}
          style={{
            minWidth: '40px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontStretch: 'condensed',
            fontSize: '1.3rem',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
          }}
        >
          {value}
          {unitLabel ? ` ${unitLabel}` : ''}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max || !canIncrement}
          aria-label={`Increase ${label}`}
          style={{
            width: '44px',
            height: '44px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
};
