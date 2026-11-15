// "Real astronaut finding" flash cards from NASA OSDR (B10.4, L13 AC2).
// Each card: a symbol for its topic, a short heading, the brief summary, then the study chip and
// a link to the study. Also used alone on Review (OsdrFinding).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { osdr, OsdrCard } from '../../content/osdr.ts';
import { Icon, IconName } from './Icon.tsx';

const TOPIC_ICON: Readonly<Record<string, IconName>> = {
  astronauts: 'helmet',
  radiation: 'atom',
  bones: 'dna',
  muscles: 'bolt',
  plants: 'plant',
};

export const OsdrFinding: React.FC<{ card: OsdrCard }> = ({ card }) => (
  <article
    className={`finding flash-card topic-${card.topic}`}
    aria-label={`${copy.osdr.label}: ${card.title}`}
  >
    <div className="flash-card-top">
      <span className="flash-icon" aria-hidden="true">
        <Icon name={TOPIC_ICON[card.topic] ?? 'book'} size={22} />
      </span>
      <div>
        <p className="finding-label">{copy.osdr.label}</p>
        <h4 className="flash-title">{copy.osdr.topics[card.topic] ?? card.topic}</h4>
      </div>
    </div>
    <p className="finding-summary">{card.summary}</p>
    <p className="finding-study" title={card.title}>
      <span className="sr-only">{copy.osdr.studyTitle}: </span>
      <em>{card.organism}</em> · {card.title}
    </p>
    <div className="flash-card-foot">
      <span className="flash-chip">{copy.osdr.studyChip(card.datasetId)}</span>
      <a className="flash-link" href={card.url} target="_blank" rel="noopener noreferrer">
        {copy.osdr.link} <Icon name="external" size={14} />
      </a>
    </div>
  </article>
);

export const OsdrCards: React.FC = () => (
  <section className="panel-card data-block data-block--findings" aria-labelledby="osdr-title">
    <div className="data-block-head">
      <span className="data-block-icon" aria-hidden="true">
        <Icon name="dna" size={26} />
      </span>
      <div>
        <h3 id="osdr-title" className="card-title">
          {copy.osdr.title}
        </h3>
        <p className="data-block-lead">{copy.osdr.intro}</p>
      </div>
    </div>
    <div className="finding-list flash-grid">
      {osdr.cards.map((c) => (
        <OsdrFinding key={c.datasetId} card={c} />
      ))}
    </div>
    <p className="data-block-note" role="note">
      <Icon name="archive" size={18} /> {copy.osdr.archived(osdr.retrievedAt)}
    </p>
  </section>
);
