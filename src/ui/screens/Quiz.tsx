// Quiz (#/quiz): one question per card. Pick an answer, then Next (or swipe the card left); the
// card slides away and the next one comes in. The last card shows the score and, for every
// question, the right answer and its explanation. Nothing is saved.

import React, { useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { quizQuestions } from '../../content/quiz.ts';
import { Icon } from '../components/Icon.tsx';
import { prefersReducedMotion } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { hrefFor } from '../router.ts';

/** Matches the slide-out time in pages.css (.quiz-card.is-leaving). */
const SLIDE_MS = 280;
/** How far (px) a finger must drag left to count as a swipe. */
const SWIPE_PX = 60;

export const QuizScreen: React.FC = () => {
  const t = copy.quizCards;
  const total = quizQuestions.length;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLeaving, setLeaving] = useState(false);
  const [needPick, setNeedPick] = useState(false);
  const startX = useRef<number | null>(null);
  const cardRef = useRef<HTMLHeadingElement>(null);
  const isDone = answers.length === total;
  const q = quizQuestions[index];

  const goNext = () => {
    if (isLeaving) return;
    if (picked === null) {
      setNeedPick(true);
      return;
    }
    const commit = () => {
      setAnswers((a) => [...a, picked]);
      setIndex((i) => i + 1);
      setPicked(null);
      setNeedPick(false);
      setLeaving(false);
      requestAnimationFrame(() => cardRef.current?.focus());
    };
    if (prefersReducedMotion()) {
      commit();
      return;
    }
    setLeaving(true);
    window.setTimeout(commit, SLIDE_MS);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setNeedPick(false);
    requestAnimationFrame(() => cardRef.current?.focus());
  };

  if (isDone) {
    const score = answers.filter((a, i) => a === quizQuestions[i]?.correctIndex).length;
    const cheer = score === total ? t.great : score * 2 >= total ? t.good : t.keepGoing;
    return (
      <div className="page quiz-page">
        <PageIntro title={t.title} />
        <section className="quiz-card quiz-result" aria-labelledby="quiz-result-title">
          <h3 id="quiz-result-title" ref={cardRef} tabIndex={-1}>
            {t.resultTitle}
          </h3>
          <p className="quiz-score">{t.score(score, total)}</p>
          <p>{cheer}</p>
          <ol className="quiz-review">
            {quizQuestions.map((qq, i) => {
              const isRight = answers[i] === qq.correctIndex;
              return (
                <li key={qq.id} className={isRight ? 'is-right' : 'is-wrong'}>
                  <p className="quiz-review-q">
                    <Icon name={isRight ? 'check' : 'cross'} size={18} />{' '}
                    <strong>{isRight ? t.right : t.wrong}:</strong> {qq.question}
                  </p>
                  {!isRight ? (
                    <p className="small">
                      {t.yourAnswer} {qq.options[answers[i] ?? 0]}
                    </p>
                  ) : null}
                  <p className="small">
                    {t.rightAnswer} {qq.options[qq.correctIndex]}
                  </p>
                  <p className="small muted">{qq.explanation}</p>
                </li>
              );
            })}
          </ol>
          <div className="button-row">
            <button type="button" className="btn-primary" onClick={restart}>
              <Icon name="retry" size={18} /> {t.again}
            </button>
            <a className="btn-link" href={hrefFor('home')}>
              {t.home}
            </a>
          </div>
        </section>
      </div>
    );
  }

  if (!q) return null;
  const isLast = index === total - 1;

  return (
    <div className="page quiz-page">
      <PageIntro title={t.title} lead={t.lead} />
      <div className="quiz-dots" aria-hidden="true">
        {quizQuestions.map((qq, i) => (
          <span
            key={qq.id}
            className={i < index ? 'is-done' : i === index ? 'is-current' : undefined}
          />
        ))}
      </div>
      <form
        className={`quiz-card${isLeaving ? ' is-leaving' : ' is-entering'}`}
        key={q.id}
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current !== null && startX.current - e.clientX > SWIPE_PX) goNext();
          startX.current = null;
        }}
      >
        <p className="quiz-progress">{t.progress(index + 1, total)}</p>
        <h3 id="quiz-q" ref={cardRef} tabIndex={-1} className="quiz-question">
          {q.question}
        </h3>
        <fieldset className="quiz-options" aria-labelledby="quiz-q">
          <legend className="sr-only">{t.optionsLabel}</legend>
          {q.options.map((opt, i) => (
            <label key={opt} className={`quiz-option${picked === i ? ' is-picked' : ''}`}>
              <input
                type="radio"
                name={`quiz-${q.id}`}
                checked={picked === i}
                onChange={() => {
                  setPicked(i);
                  setNeedPick(false);
                }}
              />{' '}
              <span>{opt}</span>
            </label>
          ))}
        </fieldset>
        <p role="status" className="quiz-need small">
          {needPick ? t.pickFirst : null}
        </p>
        <div className="button-row">
          <button type="submit" className="btn-primary btn-big">
            {isLast ? t.finish : t.next} <Icon name="next" size={20} />
          </button>
        </div>
        <p className="muted small">{t.swipeHint}</p>
      </form>
    </div>
  );
};
