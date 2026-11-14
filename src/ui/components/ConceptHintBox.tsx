// Cause chain + concept hint, built only by buildCauseChain (L7 AC5, Spec B5.9)

import React from 'react';
import { concepts } from '../../content/concepts.ts';
import { copy } from '../../content/copy.ts';
import { buildCauseChain } from '../../engine/review.ts';
import { MissionResult } from '../../engine/types.ts';
import { describeLog } from './ReplayTimeline.tsx';

export const ConceptHintBox: React.FC<{ worstResult: MissionResult }> = ({ worstResult }) => {
  const { failure, chain, concept } = buildCauseChain(worstResult);
  const c = copy.causeChain;
  const hint = concept ? concepts[concept] : null;

  return (
    <section className="panel-card" aria-labelledby="chain-title">
      <h3 id="chain-title" className="card-title">
        {c.title}
      </h3>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {c.intro}
      </p>
      {!failure ? (
        <p className="tile muted">{c.none}</p>
      ) : (
        <ol style={{ listStyle: 'none' }} className="stack">
          <li className="tile notice-danger">
            <span className="muted small">h{failure.t}</span>{' '}
            <strong>{describeLog(failure)}</strong>
          </li>
          {chain.map((link, i) => (
            <li key={i} className="tile">
              <span className="muted small">
                {c.because}, hour {link.cause.t}
              </span>
              <div>{describeLog(link.cause)}</div>
            </li>
          ))}
        </ol>
      )}
      {hint ? (
        <div
          className="tile"
          style={{ marginTop: 16, background: 'var(--carbon-wash)', borderColor: 'transparent' }}
        >
          <p style={{ fontWeight: 700 }}>
            {hint.title}: {hint.subtitle}
          </p>
          <p className="small" style={{ marginTop: 4 }}>
            {hint.summary}
          </p>
          <p className="small" style={{ marginTop: 4, fontWeight: 600 }}>
            {hint.takeaway}
          </p>
        </div>
      ) : null}
    </section>
  );
};
