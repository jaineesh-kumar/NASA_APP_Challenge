// Data and science (#/data): the archived DONKI storms, the OSDR finding cards, what is real and
// what we simplified, then the full Model Card (every number, its source and confidence, and
// the Data panel). Everything shown here is an archived copy; nothing is fetched (F10).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { Icon } from '../components/Icon.tsx';
import { OsdrCards } from '../components/OsdrCards.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { stormDate } from '../components/StormPicker.tsx';
import { ModelCardScreen } from './ModelCard.tsx';

const archive = getDonkiArchive();

export const DataScienceScreen: React.FC = () => {
  const d = copy.dataPage;
  return (
    <div className="page data-page">
      <PageIntro title={d.title} lead={d.lead} />

      <section className="panel" aria-labelledby="storm-archive-title">
        <h3 id="storm-archive-title" className="card-title">
          <Icon name="sun" size={22} /> {d.stormsTitle}
        </h3>
        <p className="archived-label">{copy.storms.archivedLabel(archive.retrievedAt)}</p>
        <p className="muted">{d.stormsIntro}</p>
        <ul className="storm-archive">
          {archive.events.map((e) => (
            <li key={e.id}>
              <span>{d.stormItem(stormDate(e), e.flareClass)}</span>{' '}
              <a href={e.link} target="_blank" rel="noopener noreferrer">
                {copy.storms.donkiLink}
              </a>
            </li>
          ))}
        </ul>
        <p className="muted small">{copy.storms.honesty}</p>
      </section>

      <section className="page-section" aria-labelledby="honesty-title">
        <h3 id="honesty-title">{d.honestyTitle}</h3>
        <ul className="honesty-list">
          {d.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="page-section">
        <OsdrCards />
      </div>

      <div className="page-section">
        <ModelCardScreen />
      </div>
    </div>
  );
};
