// In-app Data panel (B10.6): every dataset, what we use it for, archived or live, and a link.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getDonkiArchive } from '../../engine/params.ts';

const archive = getDonkiArchive();

// Links come from docs/SOURCES.md (S02-S05) and the archive itself (S12); nothing is fetched.
const LINKS: Readonly<Record<string, string>> = {
  donki: 'https://api.nasa.gov/',
  S02: 'https://doi.org/10.1126/sciadv.aaz1334',
  S04: 'https://www.nasa.gov/wp-content/uploads/2025/08/g-657270-59-hp-environmental-control-and-life-support-system-eclss.pdf',
  S05: 'https://www.science.gov/topicpages/s/sabatier+carbon+dioxide',
  S03: 'https://arxiv.org/abs/2102.11766',
};

export const DataPanel: React.FC = () => {
  const d = copy.dataPanel;
  return (
    <section className="panel-card" aria-labelledby="data-panel-title">
      <h3 id="data-panel-title" className="card-title">
        📚 {d.title}
      </h3>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {d.intro}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th scope="col">{d.colDataset}</th>
              <th scope="col">{d.colUse}</th>
              <th scope="col">{d.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: '6px 8px 6px 0' }}>
                  <a href={LINKS[row.id]} target="_blank" rel="noopener noreferrer">
                    {row.name}
                  </a>
                </td>
                <td style={{ padding: '6px 8px 6px 0' }}>{row.use}</td>
                <td style={{ padding: '6px 0' }}>
                  {row.id === 'donki' ? d.archived(archive.retrievedAt) : d.published}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
