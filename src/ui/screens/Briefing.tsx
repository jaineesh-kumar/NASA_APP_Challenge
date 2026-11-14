// Briefing step: the mission in one paragraph, how to play, the real-data note, space words (B8)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { Icon } from '../components/Icon.tsx';

export const BriefingScreen: React.FC = () => {
  const b = copy.briefing;
  const steps: Array<[string, string]> = [
    [b.step1Title, b.step1Desc],
    [b.step2Title, b.step2Desc],
    [b.step3Title, b.step3Desc],
    [b.step4Title, b.step4Desc],
  ];

  return (
    <div className="briefing">
      <h2 className="screen-title">{b.heading}</h2>
      <p className="briefing-lead">{b.summary}</p>

      <h3 className="card-title">{b.taskTitle}</h3>
      <ol className="briefing-steps">
        {steps.map(([title, desc]) => (
          <li key={title}>
            <p className="briefing-step-title">{title}</p>
            <p className="muted small">{desc}</p>
          </li>
        ))}
      </ol>

      <div className="briefing-data">
        <Icon name="sun" size={28} />
        <div>
          <p style={{ fontWeight: 700 }}>{b.realDataTitle}</p>
          <p className="small">{b.realDataBody}</p>
        </div>
      </div>

      <section aria-labelledby="glossary-title" className="briefing-glossary">
        <h3 id="glossary-title" className="card-title">
          {copy.glossary.title}
        </h3>
        <dl>
          {copy.glossary.terms.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd className="muted small">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};
