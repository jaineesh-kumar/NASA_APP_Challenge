// Mission debrief: three multiple-choice questions. A wrong answer shows why it is not right,
// a hint and the source, and the player tries again for free. A right answer shows the
// explanation and the source. Finishing saves the debrief to the Logbook.

import React, { useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { debriefs } from '../../content/debriefs.ts';
import { guidedMissions, GuidedMission } from '../../content/missions.ts';
import { SOURCE_LABELS } from '../../content/sources.ts';
import { recordDebriefDone, useProgress } from '../../state/progress.ts';
import { useAppStore } from '../../state/store.tsx';
import { startMission } from '../missionFlow.ts';
import { hrefFor } from '../router.ts';
import { Icon } from './Icon.tsx';

type Feedback = { kind: 'right' } | { kind: 'wrong'; option: number } | { kind: 'empty' };

export const Debrief: React.FC<{ mission: GuidedMission }> = ({ mission }) => {
  const d = copy.debrief;
  const questions = debriefs[mission.id];
  const progress = useProgress();
  const { dispatch } = useAppStore();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tried, setTried] = useState<readonly number[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isDone, setDone] = useState(false);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const q = questions[index];
  const isRight = feedback?.kind === 'right';
  const isLast = index === questions.length - 1;
  const missionIdx = guidedMissions.findIndex((m) => m.id === mission.id);
  const nextMission = guidedMissions[missionIdx + 1];

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q || isRight) return;
    if (picked === null) {
      setFeedback({ kind: 'empty' });
      return;
    }
    if (picked === q.correctIndex) {
      setFeedback({ kind: 'right' });
    } else {
      setFeedback({ kind: 'wrong', option: picked });
      setTried((t) => [...t, picked]);
      setPicked(null);
    }
  };

  const goNext = () => {
    if (isLast) {
      recordDebriefDone(mission.id);
      setDone(true);
      requestAnimationFrame(() => doneRef.current?.focus());
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setTried([]);
    setFeedback(null);
    requestAnimationFrame(() => promptRef.current?.focus());
  };

  if (isDone || !q) {
    const isGoalMet = progress.missions[mission.id]?.isGoalMet === true;
    return (
      <section className="panel debrief-done" aria-labelledby="debrief-done-title">
        <p className="stars" aria-hidden="true">
          <Icon name="star" size={36} />
          {isGoalMet ? <Icon name="star" size={36} /> : null}
        </p>
        <h3 id="debrief-done-title" ref={doneRef} tabIndex={-1}>
          {d.doneTitle}
        </h3>
        <p>{d.doneBody(mission.title)}</p>
        <p className="muted">{isGoalMet ? d.goalAlso : d.goalNotYet}</p>
        <div className="button-row">
          {nextMission ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => startMission(dispatch, nextMission)}
            >
              {d.nextMission}: {nextMission.title} <Icon name="next" size={18} />
            </button>
          ) : null}
          <a className="btn-link" href={hrefFor('logbook')}>
            {d.logbook}
          </a>
          <a className="btn-link" href={hrefFor('missions')}>
            {d.backToMissions}
          </a>
        </div>
      </section>
    );
  }

  const wrongOption = feedback?.kind === 'wrong' ? q.options[feedback.option] : undefined;

  return (
    <section className="panel debrief" aria-labelledby={`${q.id}-prompt`}>
      <p className="page-kicker">{d.questionOf(index + 1, questions.length)}</p>
      <form onSubmit={check}>
        <fieldset className="mcq">
          <legend className="mcq-legend">
            <h3 id={`${q.id}-prompt`} ref={promptRef} tabIndex={-1} className="mcq-prompt">
              {q.prompt}
            </h3>
          </legend>
          {q.options.map((opt, i) => {
            const wasTried = tried.includes(i);
            const isTheAnswer = isRight && i === q.correctIndex;
            return (
              <label
                key={opt.text}
                className={`mcq-option${wasTried ? ' is-tried' : ''}${isTheAnswer ? ' is-right' : ''}`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={i}
                  checked={picked === i || isTheAnswer}
                  disabled={wasTried || isRight}
                  onChange={() => {
                    setPicked(i);
                    if (feedback?.kind === 'empty') setFeedback(null);
                  }}
                />
                <span>{opt.text}</span>
                {wasTried ? <span className="mcq-tag">{d.tried}</span> : null}
                {isTheAnswer ? <Icon name="check" size={20} label={d.right} /> : null}
              </label>
            );
          })}
        </fieldset>

        <div className="mcq-feedback" role="status" aria-live="polite">
          {feedback?.kind === 'empty' ? <p>{d.pickFirst}</p> : null}
          {feedback?.kind === 'wrong' ? (
            <div className="feedback-wrong">
              <p className="feedback-title">{d.notQuite}</p>
              {wrongOption?.whyNot ? <p>{wrongOption.whyNot}</p> : null}
              <p>
                <strong>{d.hint}</strong> {q.hint}
              </p>
              <p className="feedback-source">
                {d.source} {SOURCE_LABELS[q.sourceRef]} ({q.sourceRef})
              </p>
              <p className="feedback-title">{d.tryAgain}</p>
            </div>
          ) : null}
          {isRight ? (
            <div className="feedback-right">
              <p className="feedback-title">
                <Icon name="star" size={20} /> {d.right}
              </p>
              <p>{q.explanation}</p>
              <p className="feedback-source">
                {d.source} {SOURCE_LABELS[q.sourceRef]} ({q.sourceRef})
              </p>
            </div>
          ) : null}
        </div>

        <div className="button-row">
          {isRight ? (
            <button type="button" className="btn-primary" onClick={goNext}>
              {isLast ? d.finish : d.next} <Icon name="next" size={18} />
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              {d.check}
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
