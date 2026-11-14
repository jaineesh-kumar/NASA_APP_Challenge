// Mission banner above the Free build steps while a guided mission is in play: the goal, a
// coach tip for this step, the latest result against the goal and the way to the debrief.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { StepId } from '../flow.ts';
import { isGoalMet, MISSION_GOAL_HOME, missionById } from '../missionFlow.ts';
import { hrefFor } from '../router.ts';
import { Icon } from './Icon.tsx';

export const MissionBanner: React.FC<{ step: StepId }> = ({ step }) => {
  const { state, dispatch } = useAppStore();
  const active = state.mission;
  const mission = missionById(active?.id);
  if (!active || !mission) return null;

  const m = copy.mission;
  const tip = step === 'briefing' ? undefined : mission.coach[step];
  const isMet = isGoalMet(active.lastHome);
  const isFresh = active.hasTested && !state.isResultStale;

  let status: string;
  if (!active.hasTested) status = m.notTested;
  else if (!isFresh) status = m.stale;
  else if (isMet && active.lastHome !== null) status = m.goalMet(active.lastHome);
  else status = m.goalNotYet(active.lastHome ?? 0, MISSION_GOAL_HOME);

  return (
    <section className="mission-banner" aria-labelledby="mission-banner-title">
      <div className="mission-banner-head">
        <p className="page-kicker">
          <Icon name="flag" size={16} /> {m.bannerLabel}
        </p>
        <h2 id="mission-banner-title" className="mission-banner-title">
          {mission.title}
        </h2>
      </div>
      <details className="mission-objective" open={step === 'design'}>
        <summary>{m.showObjective}</summary>
        <p>{mission.objective}</p>
      </details>
      <p className="mission-goal">{m.goal(MISSION_GOAL_HOME)}</p>
      {tip ? (
        <p className="coach-tip">
          <Icon name="bulb" size={20} /> <span>{tip}</span>
        </p>
      ) : null}
      <p className={`mission-status${isFresh && isMet ? ' is-met' : ''}`} aria-live="polite">
        {isFresh && isMet ? <Icon name="star" size={18} /> : null} {status}
      </p>
      <div className="button-row">
        {active.hasTested ? (
          <a
            className={`btn-link${isFresh && isMet ? ' btn-primary' : ''}`}
            href={hrefFor('missions', mission.id, 'debrief')}
          >
            {isFresh && isMet ? m.debrief : m.debriefAnyway} <Icon name="next" size={18} />
          </a>
        ) : null}
        <button type="button" onClick={() => dispatch({ type: 'END_MISSION' })}>
          <Icon name="close" size={18} /> {m.leave}
        </button>
      </div>
    </section>
  );
};
