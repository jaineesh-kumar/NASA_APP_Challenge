// Header: title, mission length (from params) and the real-data badge

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';

const k = getSimConstants(loadParams());

export const Header: React.FC = () => (
  <header
    className="row-between"
    style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}
  >
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {copy.header.title}
      </h1>
      <p className="muted small">{copy.header.subtitle}</p>
    </div>
    <div className="row small">
      <span className="tile" style={{ padding: '6px 12px' }}>
        {copy.header.missionDuration(k.missionHours / 24, k.crewSize)}
      </span>
      <span className="tile" style={{ padding: '6px 12px', borderColor: 'var(--viz-calm)' }}>
        ☀ {copy.header.realDataBadge}
      </span>
    </div>
  </header>
);
