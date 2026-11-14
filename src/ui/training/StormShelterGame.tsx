// Storm Shelter game screen: one work day against a real archived DONKI storm.
// Turn-based; "Next 3 hours" stops early at every radio message so the player can react.

import React, { useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { recordTrainingRound } from '../../state/progress.ts';
import { Icon } from '../components/Icon.tsx';
import { SegmentedControl } from '../components/SegmentedControl.tsx';
import { stormDate } from '../components/StormPicker.tsx';
import {
  DAY_HOURS,
  isStormHour,
  isWarningOn,
  newRound,
  newShelterState,
  playHour,
  referenceDoses,
  setSheltering,
  shelterSetup,
  ShelterState,
} from './stormShelter.ts';

const setup = shelterSetup();
const retrievedAt = getDonkiArchive().retrievedAt;

export const StormShelterGame: React.FC = () => {
  const t = copy.training.shelter;
  const [roundNo, setRoundNo] = useState(0);
  const [game, setGame] = useState<ShelterState>(newShelterState);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const round = newRound(setup, roundNo);
  const isOver = game.outcome === 'done';
  const pctOfLimit = Math.round((game.doseUsv / setup.k.doseLimitUsv) * 100);

  const radio = (() => {
    const h = game.hour;
    if (isStormHour(round, h)) return t.radioStorm;
    if (isWarningOn(round, h)) return t.radioWarning(round.onsetH - h);
    if (h >= round.endH) return t.radioOver;
    return t.radioQuiet;
  })();
  const isRadioUrgent = isWarningOn(round, game.hour) && game.hour < round.endH;

  const advance = (hours: number) => {
    const events = new Set([round.warningH, round.onsetH, round.endH]);
    let next = game;
    for (let i = 0; i < hours && next.outcome === 'playing'; i++) {
      next = playHour(setup, round, next);
      if (events.has(next.hour)) break;
    }
    setGame(next);
    if (next.outcome === 'done') {
      const isSafe = next.exposedStormHours === 0;
      recordTrainingRound('storm_shelter', isSafe ? next.workHours : 0, isSafe);
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  };

  const nextStorm = () => {
    setRoundNo((n) => n + 1);
    setGame(newShelterState());
  };

  const ref = referenceDoses(setup, round);

  return (
    <div className="game">
      <p className="game-intro">{t.intro}</p>
      <div className="storm-card">
        <p>
          <Icon name="sun" size={20} />{' '}
          <strong>{t.stormLabel(stormDate(round.storm), round.storm.flareClass)}</strong>
        </p>
        <p className="archived-label">{copy.storms.archivedLabel(retrievedAt)}</p>
        <p className="muted small">{copy.storms.honesty}</p>
        <p className="small">
          <a href={round.storm.link} target="_blank" rel="noopener noreferrer">
            {copy.storms.donkiLink}
          </a>
        </p>
      </div>

      <div className="game-status">
        <p className="game-hour">{t.hourOf(Math.min(game.hour + 1, DAY_HOURS), DAY_HOURS)}</p>
        <p className={`radio-line${isRadioUrgent ? ' is-urgent' : ''}`} role="status">
          <Icon name="antenna" size={20} /> {radio}
        </p>
        <p>
          <strong>{t.dose(Math.round(game.doseUsv))}</strong>
        </p>
        <p className="muted small">{t.doseOfLimit(pctOfLimit)}</p>
        <p>
          <strong>{t.work(game.workHours)}</strong>
        </p>
      </div>

      {!isOver ? (
        <>
          <SegmentedControl<'outside' | 'inside'>
            label={t.where}
            options={[
              { value: 'outside', label: t.outside },
              { value: 'inside', label: t.inside },
            ]}
            value={game.isSheltering ? 'inside' : 'outside'}
            onChange={(v) => setGame((g) => setSheltering(g, v === 'inside'))}
          />
          <div className="button-row" style={{ marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn-primary" onClick={() => advance(1)}>
              <Icon name="play" size={18} /> {t.next}
            </button>
            <button type="button" onClick={() => advance(3)}>
              {t.next3}
            </button>
          </div>
        </>
      ) : (
        <section className="game-result" aria-labelledby="shelter-result">
          <h3 id="shelter-result" ref={resultRef} tabIndex={-1}>
            {game.exposedStormHours === 0 ? t.doneSafe : t.doneExposed(game.exposedStormHours)}
          </h3>
          <p>{t.compare(Math.round(ref.never), Math.round(game.doseUsv), Math.round(ref.smart))}</p>
          <p>{t.work(game.workHours)}</p>
          <button type="button" className="btn-primary" onClick={nextStorm}>
            <Icon name="next" size={18} /> {t.nextStorm}
          </button>
        </section>
      )}
      <p className="muted small">{copy.training.numbersNote}</p>
    </div>
  );
};
