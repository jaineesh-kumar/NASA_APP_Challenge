// How to Play (#/how-to-play): three picture cards (the cargo clip, the ladder picture, a drawn
// test grid), then the guided first mission (M1).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { Icon } from '../components/Icon.tsx';
import { MediaCard } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { missionById, startMission } from '../missionFlow.ts';
import { hrefFor } from '../router.ts';

/** Picture 3: a grid of 20 crew dots; most filled (home), a few empty (trouble). */
const TestPicture: React.FC<{ label: string }> = ({ label }) => (
  <svg viewBox="0 0 240 140" role="img" aria-label={label} focusable="false">
    <rect width="240" height="140" rx="14" fill="var(--color-bg-highlight)" />
    {Array.from({ length: 20 }, (_, i) => {
      const x = 48 + (i % 5) * 36;
      const y = 28 + Math.floor(i / 5) * 28;
      const isHome = i !== 7 && i !== 16;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="10"
          fill={isHome ? 'var(--carbon)' : 'var(--coupon)'}
          stroke={isHome ? 'var(--carbon)' : 'var(--navy)'}
          strokeWidth="2"
        />
      );
    })}
  </svg>
);

// Step 1 is the cargo-and-scale clip, step 2 the ladder picture; step 3 keeps its drawing.
const MEDIA = [
  { id: 'cargo-weigh', caption: copy.howTo.buildCaption, fit: undefined },
  { id: 'ladder-still', caption: copy.howTo.rulesCaption, fit: 'contain' },
] as const;

export const HowToPlayScreen: React.FC = () => {
  const { dispatch } = useAppStore();
  const h = copy.howTo;
  const first = missionById('M1');

  return (
    <div className="page">
      <PageIntro title={h.title} lead={h.lead} />

      <ol className="picture-cards" aria-label={h.cardsLabel}>
        {h.cards.map((card, i) => {
          const m = MEDIA[i];
          return (
            <li key={card.title} className="picture-card">
              {m ? (
                <MediaCard
                  id={m.id}
                  caption={m.caption}
                  ratio="16/9"
                  autoPlay={false}
                  className={m.fit === 'contain' ? 'media-contain' : undefined}
                />
              ) : (
                // Same frame and caption bar as the two media cards beside it.
                <figure className="media-card">
                  <div className="media-frame drawn-frame" style={{ aspectRatio: '16 / 9' }}>
                    <TestPicture label={card.picture} />
                  </div>
                  <figcaption>
                    <span className="media-caption-text">
                      <span>{h.testCaption}</span>
                    </span>
                  </figcaption>
                </figure>
              )}
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </li>
          );
        })}
      </ol>

      {first ? (
        <section className="panel page-section first-mission" aria-labelledby="first-mission">
          <p className="page-kicker">
            <Icon name="rocket" size={16} /> {h.firstTitle}
          </p>
          <h3 id="first-mission">{first.title}</h3>
          <p>{first.objective}</p>
          <p className="muted small">{h.firstBody}</p>
          <div className="button-row">
            <button
              type="button"
              className="btn-primary btn-big"
              onClick={() => startMission(dispatch, first)}
            >
              <Icon name="play" size={22} /> {h.startGuided}
            </button>
            <a className="btn-link" href={hrefFor('missions')}>
              {h.pickMission}
            </a>
          </div>
        </section>
      ) : null}

      <p className="page-section muted">
        {h.wordsTip} <a href={hrefFor('words')}>{copy.site.pages.words}</a>.
      </p>
    </div>
  );
};
