// Landing page (#/): the story hook, one big Play button and the real-NASA-data badge.
// Crew size, mission length and test count come from data/params.json (A5.4).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { osdr } from '../../content/osdr.ts';
import { getDonkiArchive, loadParams } from '../../engine/params.ts';
import { Icon } from '../components/Icon.tsx';
import { hrefFor } from '../router.ts';

const params = loadParams();
const crew = params.getNumber('crew.size');
const days = params.getNumber('mission.hours') / 24;
const runs = params.getNumber('campaign.runs');
const archive = getDonkiArchive();
// Both archives were fetched on the same day; show the older date if they ever differ.
const retrieved = [archive.retrievedAt, osdr.retrievedAt].sort()[0] ?? archive.retrievedAt;

/** Decorative scene: grey hill, two base domes, Earth and a low Sun (south pole light). */
const MoonScene: React.FC = () => (
  <svg
    className="landing-scene"
    viewBox="0 0 360 200"
    role="img"
    aria-label={copy.landing.sceneLabel}
    focusable="false"
  >
    <rect width="360" height="200" rx="18" fill="var(--navy)" />
    {[
      [30, 30],
      [80, 60],
      [140, 22],
      [210, 48],
      [250, 18],
      [320, 40],
      [300, 88],
      [60, 100],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#e7ebf5" />
    ))}
    <circle cx="290" cy="56" r="20" fill="#2a78d6" />
    <path d="M278 48c6 2 9 7 6 12s2 8 8 7" fill="none" stroke="#1baf7a" strokeWidth="5" />
    <circle cx="46" cy="150" r="16" fill="var(--sun)" />
    <path d="M0 150c60-30 130-34 200-20s120 10 160-6V200H0Z" fill="#9fb3dd" />
    <path d="M0 168c80-18 170-20 250-8s80 6 110 0V200H0Z" fill="#c3d2f0" />
    <path d="M150 150a26 26 0 0 1 52 0Z" fill="var(--coupon)" />
    <path d="M196 152a18 18 0 0 1 36 0Z" fill="#e4ecff" />
    <rect x="168" y="138" width="16" height="12" rx="3" fill="var(--rocket)" />
    <path d="M236 152v-24M228 128h16" stroke="var(--coupon)" strokeWidth="3" />
    <rect x="226" y="120" width="20" height="8" fill="var(--carbon)" />
  </svg>
);

export const LandingScreen: React.FC = () => {
  const l = copy.landing;
  return (
    <div className="page landing">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-text">
          <p className="page-kicker">
            <Icon name="antenna" size={16} /> {l.kicker}
          </p>
          <h2 id="landing-title" className="landing-title">
            {l.title}
          </h2>
          <p className="page-lead">{l.story(crew, days)}</p>
          <div className="button-row landing-cta">
            <a className="btn-link btn-primary btn-big" href={hrefFor('how-to-play')}>
              <Icon name="play" size={22} /> {l.play}
            </a>
          </div>
          <p className="muted small">{l.playHint}</p>
        </div>
        <MoonScene />
      </section>

      <a className="data-badge" href={hrefFor('data')}>
        <span className="data-badge-icon" aria-hidden="true">
          <Icon name="sun" size={28} />
        </span>
        <span>
          <span className="data-badge-title">{l.badgeTitle}</span>
          <span className="data-badge-body">{l.badgeBody(archive.events.length, retrieved)}</span>
          <span className="data-badge-link">
            {l.badgeLink} <Icon name="next" size={16} />
          </span>
        </span>
      </a>

      <section className="page-section" aria-labelledby="inside-title">
        <h3 id="inside-title">{l.insideTitle}</h3>
        <ul className="tile-links">
          <li>
            <a href={hrefFor('missions')}>
              <Icon name="flag" size={26} />
              <span className="tile-link-title">{copy.site.pages.missions}</span>
              <span className="tile-link-body">{l.inside.missions}</span>
            </a>
          </li>
          <li>
            <a href={hrefFor('training')}>
              <Icon name="bolt" size={26} />
              <span className="tile-link-title">{copy.site.pages.training}</span>
              <span className="tile-link-body">{l.inside.training}</span>
            </a>
          </li>
          <li>
            <a href={hrefFor('free-build')}>
              <Icon name="rocket" size={26} />
              <span className="tile-link-title">{copy.site.pages['free-build']}</span>
              <span className="tile-link-body">{l.inside['free-build'](runs)}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};
