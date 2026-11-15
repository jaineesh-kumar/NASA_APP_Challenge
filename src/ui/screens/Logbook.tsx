// Logbook (#/logbook): badges, mission progress and Training Bay scores, read from the saved
// progress in this browser (localStorage, progress only). Clearing asks first.

import React, { useState } from 'react';
import { badges } from '../../content/badges.ts';
import { copy } from '../../content/copy.ts';
import { badgeMedia, media } from '../../content/media.ts';
import { guidedMissions } from '../../content/missions.ts';
import { resetProgress, TrainingId, useProgress } from '../../state/progress.ts';
import { Icon } from '../components/Icon.tsx';
import { MediaCard, mediaUrl } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';

const GAMES: ReadonlyArray<[TrainingId, string]> = [
  ['power_juggle', copy.training.juggle.name],
  ['storm_shelter', copy.training.shelter.name],
];

export const LogbookScreen: React.FC = () => {
  const l = copy.logbook;
  const progress = useProgress();
  const [isAsking, setAsking] = useState(false);
  const [justCleared, setJustCleared] = useState(false);
  const earned = badges.filter((b) => b.isEarned(progress));

  return (
    <div className="page">
      <div className="page-intro-with-picture">
        <div>
          <PageIntro title={l.title} lead={l.lead} />
          <p className="muted small">{l.privacy}</p>
        </div>
        <MediaCard id="crew-wave" ratio="1/1" caption={l.crewCaption} className="media-small" />
      </div>

      <section className="page-section" aria-labelledby="badges-title">
        <h3 id="badges-title">{l.badgesTitle}</h3>
        <p className="muted">{l.badgesCount(earned.length, badges.length)}</p>
        <ul className="badge-grid">
          {badges.map((b) => {
            const isEarned = b.isEarned(progress);
            const pic = badgeMedia[b.id];
            return (
              <li key={b.id} className={`badge${isEarned ? ' is-earned' : ''}`}>
                <span className={`badge-icon${pic ? ' has-picture' : ''}`} aria-hidden="true">
                  {pic ? (
                    <img src={mediaUrl(media[pic])} alt="" width={48} height={48} loading="lazy" />
                  ) : (
                    <Icon name={isEarned ? 'star' : 'lock'} size={28} />
                  )}
                </span>
                <span className="badge-name">{b.name}</span>
                <span className="badge-state">{isEarned ? l.earned : l.locked}</span>
                <span className="badge-how">{b.howTo}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="page-section" aria-labelledby="log-missions-title">
        <h3 id="log-missions-title">{l.missionsTitle}</h3>
        <div className="table-scroll">
          <table className="log-table">
            <thead>
              <tr>
                <th scope="col">{l.colMission}</th>
                <th scope="col">{l.colBest}</th>
                <th scope="col">{l.colGoal}</th>
                <th scope="col">{l.colDebrief}</th>
              </tr>
            </thead>
            <tbody>
              {guidedMissions.map((m) => {
                const p = progress.missions[m.id];
                return (
                  <tr key={m.id}>
                    <th scope="row">{m.title}</th>
                    <td>{p?.bestHome != null ? l.bestOf(p.bestHome) : l.none}</td>
                    <td>{p?.isGoalMet ? l.yes : l.no}</td>
                    <td>{p?.isDebriefDone ? l.yes : l.no}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-section" aria-labelledby="log-training-title">
        <h3 id="log-training-title">{l.trainingTitle}</h3>
        <div className="table-scroll">
          <table className="log-table">
            <thead>
              <tr>
                <th scope="col">{l.colGame}</th>
                <th scope="col">{l.colPlays}</th>
                <th scope="col">{l.colScore}</th>
                <th scope="col">{l.colCleared}</th>
              </tr>
            </thead>
            <tbody>
              {GAMES.map(([id, name]) => {
                const p = progress.training[id];
                return (
                  <tr key={id}>
                    <th scope="row">{name}</th>
                    <td>{p?.plays ?? 0}</td>
                    <td>{p ? p.bestScore : l.none}</td>
                    <td>{p?.hasCleared ? l.yes : l.no}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-section">
        {isAsking ? (
          <div className="panel" role="group" aria-labelledby="clear-ask">
            <p id="clear-ask" className="feedback-title">
              {l.clearAsk}
            </p>
            <div className="button-row" style={{ marginTop: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  resetProgress();
                  setAsking(false);
                  setJustCleared(true);
                }}
              >
                {l.clearYes}
              </button>
              <button type="button" onClick={() => setAsking(false)}>
                {l.clearNo}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAsking(true);
              setJustCleared(false);
            }}
          >
            {l.clear}
          </button>
        )}
        <p role="status" className="muted small">
          {justCleared ? l.cleared : null}
        </p>
      </section>
    </div>
  );
};
