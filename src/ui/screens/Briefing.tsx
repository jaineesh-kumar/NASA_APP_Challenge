// Briefing: the mission in one paragraph, how to play, real data note, glossary (Spec B8)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';

export const BriefingScreen: React.FC = () => {
  const { dispatch } = useAppStore();
  const b = copy.briefing;
  const steps: Array<[string, string]> = [
    [b.step1Title, b.step1Desc],
    [b.step2Title, b.step2Desc],
    [b.step3Title, b.step3Desc],
    [b.step4Title, b.step4Desc],
  ];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <section className="panel-card">
        <h2 className="screen-title" style={{ fontSize: '1.75rem' }}>
          {b.heading}
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: '8px 0 24px' }}>{b.summary}</p>

        <h3 className="card-title">{b.taskTitle}</h3>
        <ol className="tiles" style={{ listStyle: 'none', marginBottom: 24 }}>
          {steps.map(([title, desc]) => (
            <li key={title} className="tile">
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{title}</p>
              <p className="muted small">{desc}</p>
            </li>
          ))}
        </ol>

        <div className="tile" style={{ borderLeft: '4px solid var(--viz-calm)', marginBottom: 24 }}>
          <p style={{ fontWeight: 700 }}>☀ {b.realDataTitle}</p>
          <p className="small">{b.realDataBody}</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'design' })}
            style={{ fontSize: '1.1rem', padding: '12px 28px' }}
          >
            {b.startButton}
          </button>
        </div>
      </section>

      <section className="panel-card" aria-labelledby="glossary-title">
        <h3 id="glossary-title" className="card-title">
          {copy.glossary.title}
        </h3>
        <dl className="tiles">
          {copy.glossary.terms.map((g) => (
            <div key={g.term} className="tile">
              <dt style={{ fontWeight: 700 }}>{g.term}</dt>
              <dd className="muted small">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};
