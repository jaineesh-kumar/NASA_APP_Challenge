// Power Juggle game screen. Turn-based (no timers), so it works with a keyboard, a switch
// device or a screen reader as well as with touch.

import React, { useMemo, useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { LOAD_IDS } from '../../engine/constants.ts';
import { LoadId } from '../../engine/types.ts';
import { recordTrainingRound } from '../../state/progress.ts';
import { Icon } from '../components/Icon.tsx';
import {
  bestPossibleWork,
  ESSENTIAL_LOADS,
  hoursLeft,
  juggleDemands,
  juggleSetup,
  JuggleState,
  newJuggle,
  runHour,
  toggleLoad,
} from './powerJuggle.ts';

const setup = juggleSetup();
const best = bestPossibleWork(setup);

export const PowerJuggleGame: React.FC = () => {
  const t = copy.training.juggle;
  const [game, setGame] = useState<JuggleState>(() => newJuggle(setup));
  const [hadRadioOff, setHadRadioOff] = useState(false);
  const resultRef = useRef<HTMLHeadingElement>(null);
  // Demand of each machine when it is switched on, for its label.
  const onDemands = useMemo(
    () =>
      juggleDemands(setup, {
        ...game,
        isOn: Object.fromEntries(LOAD_IDS.map((l) => [l, true])) as Record<LoadId, boolean>,
      }),
    [game],
  );

  const pct = Math.round((game.batteryKwh / setup.capacityKwh) * 100);
  const isOver = game.outcome !== 'playing';

  const advance = (hours: number) => {
    let next = game;
    let radioOff = hadRadioOff;
    for (let i = 0; i < hours && next.outcome === 'playing'; i++) {
      if (!next.isOn.comms) radioOff = true;
      next = runHour(setup, next);
    }
    setHadRadioOff(radioOff);
    setGame(next);
    if (next.outcome !== 'playing') {
      const isSafe = next.outcome === 'sunrise';
      recordTrainingRound('power_juggle', isSafe ? next.workHours : 0, isSafe);
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  };

  const restart = () => {
    setGame(newJuggle(setup));
    setHadRadioOff(false);
  };

  return (
    <div className="game">
      <p className="game-intro">{t.intro(setup.darkHours, setup.capacityKwh)}</p>

      <div className="game-status">
        <p className="game-hour">
          {t.hourOf(Math.min(game.hour + 1, setup.darkHours), setup.darkHours)}
        </p>
        <div
          className="game-meter"
          role="meter"
          aria-label={t.battery}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={t.batteryText(Math.round(game.batteryKwh), pct)}
        >
          <span className="game-meter-fill" style={{ width: `${pct}%` }} />
        </div>
        <p>
          <strong>{t.battery}:</strong> {t.batteryText(Math.round(game.batteryKwh), pct)}
        </p>
        <p className="muted small" aria-live="polite">
          {isOver ? null : t.hoursLeft(hoursLeft(setup, game))}
        </p>
        <p>
          <strong>{t.work(game.workHours)}</strong>
        </p>
      </div>

      <fieldset className="switch-list" disabled={isOver}>
        <legend className="card-title">{t.machinesTitle}</legend>
        {LOAD_IDS.map((l) => {
          const isOn = game.isOn[l];
          const isNeeded = ESSENTIAL_LOADS.includes(l);
          const kw = onDemands[l];
          return (
            <button
              key={l}
              type="button"
              role="switch"
              aria-checked={isOn}
              className={`switch-row${isOn ? ' is-on' : ''}`}
              disabled={isOver || kw === 0}
              onClick={() => setGame((g) => toggleLoad(g, l))}
            >
              <span className="switch-name">
                {copy.loads[l]}
                {isNeeded ? <span className="switch-tag">{t.essential}</span> : null}
              </span>
              <span className="switch-kw">{t.kw(kw)}</span>
              <span className="switch-state" aria-hidden="true">
                {isOn ? t.on : t.off}
              </span>
            </button>
          );
        })}
      </fieldset>

      {game.starvedLastHour.length > 0 && !isOver ? (
        <p className="game-alert" role="alert">
          {t.starved(game.starvedLastHour.map((l) => copy.loads[l]).join(', '))}
        </p>
      ) : null}

      {isOver ? (
        <section className="game-result" aria-labelledby="juggle-result">
          <h3 id="juggle-result" ref={resultRef} tabIndex={-1}>
            {game.outcome === 'sunrise' ? (
              <>
                <Icon name="sun" size={24} /> {t.sunrise}
              </>
            ) : (
              t.trouble(copy.loads[game.troubleLoad ?? 'life_support'])
            )}
          </h3>
          {game.outcome === 'sunrise' ? <p>{t.sunriseScore(game.workHours, best)}</p> : null}
          {hadRadioOff ? <p className="muted">{t.radioOff}</p> : null}
          <button type="button" className="btn-primary" onClick={restart}>
            <Icon name="retry" size={18} /> {t.again}
          </button>
        </section>
      ) : (
        <div className="button-row">
          <button type="button" className="btn-primary" onClick={() => advance(1)}>
            <Icon name="play" size={18} /> {t.run1}
          </button>
          <button type="button" onClick={() => advance(6)}>
            {t.run6}
          </button>
          <button type="button" onClick={restart}>
            <Icon name="retry" size={18} /> {t.again}
          </button>
        </div>
      )}
      <p className="muted small">{copy.training.numbersNote}</p>
    </div>
  );
};
