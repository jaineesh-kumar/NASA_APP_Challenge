// Briefing step: the mission in one paragraph and the Start button, then tabs for how to play,
// the real-data note and space words (B8)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { Icon } from '../components/Icon.tsx';
import { MediaCard } from '../components/MediaCard.tsx';
import { SectionTabs } from '../components/SectionTabs.tsx';
import { StepHeader } from '../components/StepHeader.tsx';

export const BriefingScreen: React.FC = () => {
  const b = copy.briefing;
  const tabs = copy.stepTabs.briefing;
  const steps: Array<[string, string]> = [
    [b.step1Title, b.step1Desc],
    [b.step2Title, b.step2Desc],
    [b.step3Title, b.step3Desc],
    [b.step4Title, b.step4Desc],
  ];

  return (
    <div className="briefing">
      <StepHeader
        step="briefing"
        title={b.heading}
        lead={b.summary}
        media={
          <MediaCard
            id="base-tour"
            ratio="4/3"
            caption={b.mediaCaption}
            autoPlay={false}
            className="media-small"
          />
        }
      />

      <SectionTabs
        label={copy.stepTabs.listLabel(copy.nav.briefing)}
        tabs={[
          {
            id: 'jobs',
            label: tabs.jobs,
            content: (
              <ol className="briefing-steps">
                {steps.map(([title, desc]) => (
                  <li key={title}>
                    <p className="briefing-step-title">{title}</p>
                    <p className="muted small">{desc}</p>
                  </li>
                ))}
              </ol>
            ),
          },
          {
            id: 'data',
            label: tabs.data,
            content: (
              <div className="briefing-data">
                <Icon name="sun" size={28} />
                <div>
                  <p style={{ fontWeight: 700 }}>{b.realDataTitle}</p>
                  <p className="small">{b.realDataBody}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'words',
            label: tabs.words,
            content: (
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
            ),
          },
        ]}
      />
    </div>
  );
};
