// Landing page (#/): the story hook beside the hero clip, one big Play button, the real-data
// badge, the four-part journey, the crew and storm clips, and a decorative Moon horizon.
// Crew size, mission length and test count come from data/params.json (A5.4).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { MediaId } from '../../content/media.ts';
import { osdr } from '../../content/osdr.ts';
import { getDonkiArchive, loadParams } from '../../engine/params.ts';
import { Icon } from '../components/Icon.tsx';
import { MediaCard } from '../components/MediaCard.tsx';
import { hrefFor } from '../router.ts';

const params = loadParams();
const crew = params.getNumber('crew.size');
const days = params.getNumber('mission.hours') / 24;
const runs = params.getNumber('campaign.runs');
const archive = getDonkiArchive();
// The trip in order: lift-off, the flight across, the landing, then setting up camp.
const JOURNEY: ReadonlyArray<[MediaId, keyof typeof copy.landing.storyParts]> = [
  ['rocket-launch', 'launch'],
  ['rocket-flight', 'flight'],
  ['rocket-landing', 'landing'],
  ['base-setup', 'base'],
];
// Both archives were fetched on the same day; show the older date if they ever differ.
const retrieved = [archive.retrievedAt, osdr.retrievedAt].sort()[0] ?? archive.retrievedAt;

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
        <MediaCard id="crew-walkout" caption={l.heroCaption} className="landing-hero-media" />
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

      <section className="page-section" aria-labelledby="story-title">
        <h3 id="story-title" className="card-title">
          {l.storyTitle}
        </h3>
        <p className="muted small">{l.storyHint}</p>
        <ol className="journey-strip" aria-label={l.storyLabel}>
          {JOURNEY.map(([id, part]) => (
            <li key={id}>
              <MediaCard id={id} caption={l.storyParts[part]} autoPlay={false} />
            </li>
          ))}
        </ol>
      </section>

      <div className="landing-media-row page-section">
        <section aria-labelledby="crew-title">
          <h3 id="crew-title" className="card-title">
            {l.crewTitle}
          </h3>
          <MediaCard id="crew-walk" caption={l.crewCaption} autoPlay={false} />
        </section>
        <section aria-labelledby="storm-teaser-title">
          <h3 id="storm-teaser-title" className="card-title">
            {l.stormTitle}
          </h3>
          <MediaCard id="storm-shelter" caption={l.stormTeaser} />
          <a className="btn-link landing-storm-link" href={hrefFor('data')}>
            <Icon name="sun" size={18} /> {l.stormLink}
          </a>
        </section>
      </div>

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

      <MediaCard id="moon-horizon" decorative className="horizon-strip" />
    </div>
  );
};
