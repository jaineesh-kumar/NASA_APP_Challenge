// Missions (#/missions): the five guided missions with their progress, and each mission's
// debrief at #/missions/<id>/debrief (open once the mission has been tested).

import React from 'react';
import { concepts } from '../../content/concepts.ts';
import { copy } from '../../content/copy.ts';
import { guidedMissions, GuidedMission } from '../../content/missions.ts';
import { ConceptId } from '../../engine/review.ts';
import { useProgress } from '../../state/progress.ts';
import { useAppStore } from '../../state/store.tsx';
import { Debrief } from '../components/Debrief.tsx';
import { Icon } from '../components/Icon.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { missionById, startMission } from '../missionFlow.ts';
import { hrefFor, useRoute } from '../router.ts';

const conceptTitle = (id: string): string => concepts[id as ConceptId]?.title ?? id;

const MissionCard: React.FC<{ mission: GuidedMission; n: number }> = ({ mission, n }) => {
  const p = copy.missionsPage;
  const { dispatch } = useAppStore();
  const done = useProgress().missions[mission.id];
  const hasTested = done?.bestHome !== null && done?.bestHome !== undefined;
  const titleId = `mission-${mission.id}`;

  return (
    <li className={`mission-card${done?.isDebriefDone ? ' is-complete' : ''}`}>
      <p className="mission-card-number" aria-hidden="true">
        {n}
      </p>
      <div className="mission-card-body">
        <h3 id={titleId}>{mission.title}</h3>
        <p className="mission-card-sub">{mission.subtitle}</p>
        <p className="small">
          <strong>{p.concept}</strong> {conceptTitle(mission.conceptTarget)}
        </p>
        <ul className="mission-badges" aria-label={`${mission.title}: progress`}>
          {!hasTested ? <li>{p.notStarted}</li> : null}
          {hasTested && done?.bestHome != null ? <li>{p.best(done.bestHome)}</li> : null}
          {done?.isGoalMet ? (
            <li className="is-good">
              <Icon name="star" size={16} /> {p.goalStar}
            </li>
          ) : null}
          {done?.isDebriefDone ? (
            <li className="is-good">
              <Icon name="check" size={16} /> {p.complete}
            </li>
          ) : null}
        </ul>
        <div className="button-row">
          <button
            type="button"
            className="btn-primary"
            aria-describedby={titleId}
            onClick={() => startMission(dispatch, mission)}
          >
            <Icon name="play" size={18} /> {hasTested ? p.again : p.start}
          </button>
          {hasTested ? (
            <a
              className="btn-link"
              href={hrefFor('missions', mission.id, 'debrief')}
              aria-describedby={titleId}
            >
              {p.debrief}
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
};

const DebriefPage: React.FC<{ id: string | undefined }> = ({ id }) => {
  const d = copy.debrief;
  const { state, dispatch } = useAppStore();
  const progress = useProgress();
  const mission = missionById(id);

  if (!mission) {
    return (
      <div className="page">
        <PageIntro title={d.unknown} />
        <a className="btn-link" href={hrefFor('missions')}>
          {d.backToMissions}
        </a>
      </div>
    );
  }

  const isTested =
    (state.mission?.id === mission.id && state.mission.hasTested) ||
    progress.missions[mission.id]?.bestHome != null;

  return (
    <div className="page">
      <PageIntro kicker={d.kicker} title={mission.title} />
      {isTested ? (
        <Debrief mission={mission} />
      ) : (
        <section className="panel">
          <h3 className="card-title">{d.needTest}</h3>
          <p>{d.needTestBody}</p>
          <div className="button-row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => startMission(dispatch, mission)}
            >
              <Icon name="play" size={18} /> {copy.missionsPage.start}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export const MissionsScreen: React.FC = () => {
  const route = useRoute();
  const p = copy.missionsPage;
  if (route.sub[1] === 'debrief') return <DebriefPage id={route.sub[0]} />;

  return (
    <div className="page">
      <PageIntro title={p.title} lead={p.lead} />
      <ol className="mission-list" aria-label={p.listLabel}>
        {guidedMissions.map((m, i) => (
          <MissionCard key={m.id} mission={m} n={i + 1} />
        ))}
      </ol>
    </div>
  );
};
