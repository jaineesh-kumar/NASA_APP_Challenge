// How to Play (#/how-to-play): three picture cards, then the guided first mission (M1).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { Icon } from '../components/Icon.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { missionById, startMission } from '../missionFlow.ts';
import { hrefFor } from '../router.ts';

/** Picture 1: a rocket beside its cargo, with a nearly full weight bar. */
const BuildPicture: React.FC<{ label: string }> = ({ label }) => (
  <svg viewBox="0 0 240 140" role="img" aria-label={label} focusable="false">
    <rect width="240" height="140" rx="14" fill="var(--color-bg-highlight)" />
    <path d="M60 22c14 10 20 28 18 50l-8 10H50l-8-10c-2-22 4-40 18-50Z" fill="var(--coupon)" />
    <circle cx="60" cy="52" r="7" fill="var(--carbon)" />
    <path d="M42 82 32 100l14-4M78 82l10 18-14-4" fill="var(--rocket)" />
    <rect x="108" y="58" width="30" height="24" rx="4" fill="var(--sun)" />
    <rect x="144" y="50" width="30" height="32" rx="4" fill="var(--carbon)" />
    <rect x="180" y="62" width="30" height="20" rx="4" fill="var(--rocket)" />
    <rect x="108" y="104" width="102" height="14" rx="7" fill="var(--coupon)" />
    <rect x="108" y="104" width="86" height="14" rx="7" fill="var(--navy)" />
  </svg>
);

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

const PICTURES = [BuildPicture, RulesPicture, TestPicture] as const;

export const HowToPlayScreen: React.FC = () => {
  const { dispatch } = useAppStore();
  const h = copy.howTo;
  const first = missionById('M1');

  return (
    <div className="page">
      <PageIntro title={h.title} lead={h.lead} />

      <ol className="picture-cards" aria-label={h.cardsLabel}>
        {h.cards.map((card, i) => {
          const Picture = PICTURES[i] ?? BuildPicture;
          return (
            <li key={card.title} className="picture-card">
              <Picture label={card.picture} />
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
