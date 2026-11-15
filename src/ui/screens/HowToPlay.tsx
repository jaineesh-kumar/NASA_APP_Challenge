// How to Play (#/how-to-play): three picture cards (the first is the cargo clip), then the guided first mission (M1).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { Icon } from '../components/Icon.tsx';
import { MediaCard } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { missionById, startMission } from '../missionFlow.ts';
import { hrefFor } from '../router.ts';

/** Picture 2: a priority ladder, the top rung marked as most important. */
const RulesPicture: React.FC<{ label: string }> = ({ label }) => (
  <svg viewBox="0 0 240 140" role="img" aria-label={label} focusable="false">
    <rect width="240" height="140" rx="14" fill="var(--color-bg-highlight)" />
    <path d="M70 14v112M170 14v112" stroke="var(--navy)" strokeWidth="6" />
    {[30, 58, 86, 114].map((y, i) => (
      <rect
        key={y}
        x="76"
        y={y - 9}
        width="88"
        height="18"
        rx="5"
        fill={i === 0 ? 'var(--rocket)' : 'var(--coupon)'}
        stroke="var(--navy)"
        strokeWidth="2"
      />
    ))}
    <path d="m190 30 10-8v16Z" fill="var(--rocket)" />
    <circle cx="40" cy="36" r="14" fill="var(--sun)" />
  </svg>
);

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

// Step 1 uses the cargo-and-scale clip; steps 2 and 3 keep their drawn pictures.
const PICTURES = [null, RulesPicture, TestPicture] as const;

export const HowToPlayScreen: React.FC = () => {
  const { dispatch } = useAppStore();
  const h = copy.howTo;
  const first = missionById('M1');

  return (
    <div className="page">
      <PageIntro title={h.title} lead={h.lead} />

      <ol className="picture-cards" aria-label={h.cardsLabel}>
        {h.cards.map((card, i) => {
          const Picture = PICTURES[i];
          return (
            <li key={card.title} className="picture-card">
              {Picture ? (
                <Picture label={card.picture} />
              ) : (
                <MediaCard id="cargo-weigh" caption={h.buildCaption} autoPlay={false} />
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
            <Icon name="flag" size={16} /> {h.firstTitle}
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
