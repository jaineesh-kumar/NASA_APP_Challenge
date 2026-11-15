// For teachers (#/teachers): a short guide (lesson plan, big ideas, modes, honesty notes) and
// the classroom tools: pre/post quiz, guided missions and scenario codes (the Learn screen).

import React from 'react';
import { concepts } from '../../content/concepts.ts';
import { copy } from '../../content/copy.ts';
import { SOURCE_LABELS, SourceId } from '../../content/sources.ts';
import { MediaCard } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { MISSION_GOAL_HOME } from '../missionFlow.ts';
import { LearnScreen } from './Learn.tsx';

const sourceLabel = (id: string) => SOURCE_LABELS[id as SourceId] ?? id;

export const TeachersScreen: React.FC = () => {
  const t = copy.teachers;
  return (
    <div className="page">
      <PageIntro title={t.title} lead={t.lead} />
      <MediaCard id="classroom" caption={t.classroomCaption} className="page-picture" />
      <p className="muted small">{t.privacy}</p>

      <section className="page-section" aria-labelledby="plan-title">
        <h3 id="plan-title">{t.planTitle}</h3>
        <ol className="honesty-list">
          {t.plan(MISSION_GOAL_HOME).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="page-section" aria-labelledby="concepts-title">
        <h3 id="concepts-title">{t.conceptsTitle}</h3>
        <dl className="word-list">
          {Object.values(concepts).map((c) => (
            <div key={c.id} className="word-card">
              <dt>
                {c.title}: {c.subtitle}
              </dt>
              <dd>
                <p>{c.summary}</p>
                <p className="muted small">
                  {copy.debrief.source} {sourceLabel(c.sourceRef)} ({c.sourceRef})
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-section" aria-labelledby="modes-title">
        <h3 id="modes-title">{t.modesTitle}</h3>
        <p>{t.modesBody}</p>
        <p className="muted small" style={{ marginTop: 'var(--space-2)' }}>
          {t.reviewNote}
        </p>
      </section>

      <section className="page-section" aria-labelledby="tools-title">
        <h3 id="tools-title">{t.toolsTitle}</h3>
        <p className="muted">{t.toolsIntro}</p>
        <div className="page-section">
          <LearnScreen />
        </div>
      </section>
    </div>
  );
};
