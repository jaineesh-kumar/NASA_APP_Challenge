// "Real astronaut finding" cards from NASA OSDR (B10.4, L13 AC2).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { osdr, OsdrCard } from '../../content/osdr.ts';
import { Icon } from './Icon.tsx';

export const OsdrFinding: React.FC<{ card: OsdrCard }> = ({ card }) => (
  <article className="finding" aria-label={`${copy.osdr.label}: ${card.title}`}>
    <p className="finding-label">
      <Icon name="book" size={18} /> {copy.osdr.label}
    </p>
    <p className="finding-summary">{card.summary}</p>
    <p className="small muted">{copy.osdr.source(card.datasetId, card.title)}</p>
    <p className="small">
      <a href={card.url} target="_blank" rel="noopener noreferrer">
        {copy.osdr.link}
      </a>
    </p>
  </article>
);

export const OsdrCards: React.FC = () => (
  <section className="panel-card" aria-labelledby="osdr-title">
    <h3 id="osdr-title" className="card-title">
      {copy.osdr.title}
    </h3>
    <p className="muted small" style={{ marginBottom: 12 }}>
      {copy.osdr.intro}
    </p>
    <div className="finding-list">
      {osdr.cards.map((c) => (
        <OsdrFinding key={c.datasetId} card={c} />
      ))}
    </div>
    <p className="small" role="note" style={{ marginTop: 12, fontWeight: 600 }}>
      <Icon name="archive" size={18} /> {copy.osdr.archived(osdr.retrievedAt)}
    </p>
  </section>
);
