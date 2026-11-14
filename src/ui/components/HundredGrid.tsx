// "X out of every 100 crews came home" as a grid of 100 crew icons (L11 AC5).
// Filled icons came home; outlined icons ran into trouble. The count is also in text, so colour
// is never the only signal.

import React from 'react';
import { copy } from '../../content/copy.ts';

const CELLS = Array.from({ length: 100 }, (_, i) => i);

export const HundredGrid: React.FC<{ home: number }> = ({ home }) => (
  <figure className="hundred">
    <div className="hundred-grid" role="img" aria-label={copy.hundred.label(home)}>
      {CELLS.map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
          className={i < home ? 'crew is-home' : 'crew'}
        >
          <circle cx="8" cy="5" r="3" />
          <path d="M2.5 15c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5Z" />
        </svg>
      ))}
    </div>
    <figcaption className="legend">
      <span>
        <span className="legend-swatch" style={{ background: 'var(--carbon)' }} />
        {copy.hundred.home}
      </span>
      <span>
        <span
          className="legend-swatch"
          style={{ background: 'var(--coupon)', border: '2px solid #9fb3dd' }}
        />
        {copy.hundred.trouble}
      </span>
    </figcaption>
  </figure>
);
