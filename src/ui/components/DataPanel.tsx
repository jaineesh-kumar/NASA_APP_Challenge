// In-app Data panel (B10.6): every dataset, what we use it for, archived or live, and a link.
// Shown as flash cards: a symbol, the dataset name, what we use it for, its status and a link.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { osdr } from '../../content/osdr.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { Icon, IconName } from './Icon.tsx';

const archive = getDonkiArchive();

// Links come from docs/SOURCES.md (S02-S05) and the archive itself (S12); nothing is fetched.
const LINKS: Readonly<Record<string, string>> = {
  donki: 'https://api.nasa.gov/',
  S02: 'https://doi.org/10.1126/sciadv.aaz1334',
  S04: 'https://www.nasa.gov/wp-content/uploads/2025/08/g-657270-59-hp-environmental-control-and-life-support-system-eclss.pdf',
  S05: 'https://www.science.gov/topicpages/s/sabatier+carbon+dioxide',
  S03: 'https://arxiv.org/abs/2102.11766',
  osdr: 'https://osdr.nasa.gov/bio/repo/',
};

const ROW_ICON: Readonly<Record<string, IconName>> = {
  donki: 'flare',
  S02: 'atom',
  S04: 'drop',
  S05: 'retry',
  S03: 'sun',
  osdr: 'dna',
};

export const DataPanel: React.FC = () => {
  const d = copy.dataPanel;
  return (
    <section
      className="panel-card data-block data-block--sources"
      aria-labelledby="data-panel-title"
    >
      <div className="data-block-head">
        <span className="data-block-icon" aria-hidden="true">
          <Icon name="database" size={26} />
        </span>
        <div>
          <h3 id="data-panel-title" className="card-title">
            {d.title}
          </h3>
          <p className="data-block-lead">{d.intro}</p>
        </div>
      </div>
      <ul className="flash-grid source-grid">
        {d.rows.map((row) => {
          const isArchived = row.id === 'donki' || row.id === 'osdr';
          const status =
            row.id === 'donki'
              ? d.archived(archive.retrievedAt)
              : row.id === 'osdr'
                ? d.archived(osdr.retrievedAt)
                : d.published;
          return (
            <li key={row.id} className="flash-card source-card">
              <div className="flash-card-top">
                <span className="flash-icon" aria-hidden="true">
                  <Icon name={ROW_ICON[row.id] ?? 'book'} size={22} />
                </span>
                <h4 className="flash-title">{row.name}</h4>
              </div>
              <p className="flash-text">{row.use}</p>
              <div className="flash-card-foot">
                <span className={`flash-chip ${isArchived ? 'chip-archived' : 'chip-published'}`}>
                  <Icon name={isArchived ? 'archive' : 'book'} size={14} /> {status}
                </span>
                <a
                  className="flash-link"
                  href={LINKS[row.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {d.openSource}
                  <span className="sr-only">: {row.name}</span> <Icon name="external" size={14} />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
