// Header component displaying title and mission context
// Spec B4.9, B4.10

import React from 'react';
import { copy } from '../../content/copy.ts';

export const Header: React.FC = () => {
  return (
    <header
      role="banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '20px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          {copy.header.title}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {copy.header.subtitle}
        </p>
      </div>
      <div
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-bg-surface-elevated)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        {copy.header.missionDuration}
      </div>
    </header>
  );
};
