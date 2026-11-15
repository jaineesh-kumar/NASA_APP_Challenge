// Mission Day (#/mission-day, ADR-016): one order each morning, then the engine runs that day.
// Shows the three core meters, the day's news, what the crew knows about tomorrow and the six
// orders, each with what it helps and what it costs. A real archived DONKI storm is in every run.

import React, { useMemo, useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { DayOrder, LogEntry } from '../../engine/types.ts';
import { ComponentId } from '../../engine/types.ts';
import { CoreMeters } from '../components/CoreMeters.tsx';
import { Icon } from '../components/Icon.tsx';
import { MediaCard } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { ArchivedLabel, findStorm, stormModeName } from '../components/StormPicker.tsx';
import {
  DAY_ORDERS,
  daySetup,
  dayView,
  k,
  MISSION_DAYS,
  MOON_DELAY_S,
  simulate,
} from '../missionDay/missionDay.ts';

const componentName = (id: string): string =>
  copy.components[id as ComponentId] ?? copy.components.co2_scrubber;

/** One log entry in plain words. */
function newsLine(e: LogEntry): string {
  const n = copy.missionDay.news;
  switch (e.type) {
    case 'spe_start':
      return e.detail === 'sheltered' ? n.spe_start_sheltered : n.spe_start_unsheltered;
    case 'component_failed': {
      const [id = '', flag] = e.detail.split(' ');
      return flag === 'no_spare'
        ? n.component_failed_no_spare(componentName(id))
        : n.component_failed(componentName(id));
    }
    case 'component_repaired':
      return n.component_repaired(componentName(e.detail));
    case 'failure':
      return n.failure(copy.causes[e.detail as keyof typeof copy.causes] ?? e.detail);
    case 'dark_window_start':
    case 'dark_window_end':
    case 'dust_start':
    case 'spe_warning':
    case 'spe_end':
    case 'warning_missed':
    case 'battery_empty':
    case 'shield_layer_built':
      return n[e.type];
    default:
      return '';
  }
}

export const MissionDayScreen: React.FC = () => {
  const t = copy.missionDay;
  const [round, setRound] = useState(0);
  const [orders, setOrders] = useState<DayOrder[]>([]);
  const [pick, setPick] = useState<DayOrder>('full_speed');
  const statusRef = useRef<HTMLHeadingElement>(null);

  const setup = useMemo(() => daySetup(round), [round]);
  const result = useMemo(() => simulate(setup, orders), [setup, orders]);
  const view = dayView(result, orders.length);
  const isOver = view.isLost || view.isFinished;
  const storm = findStorm(setup.stormMode);

  const runDay = () => {
    setOrders((o) => [...o, pick]);
    requestAnimationFrame(() => statusRef.current?.focus());
  };
  const restart = (nextRound: number) => {
    setRound(nextRound);
    setOrders([]);
    setPick('full_speed');
  };

  return (
    <div className="page mission-day">
      {/* Intro card: heading and description on the left, the clip on the right. */}
      <section className="intro-card info-card">
        <div className="intro-card-text">
          <PageIntro title={t.title} lead={t.lead} />
          <p className="small">
            {storm ? t.stormLine(stormModeName(setup.stormMode)) : null} {t.setupLine}
          </p>
          {storm ? <ArchivedLabel /> : null}
        </div>
        <MediaCard
          id="night-falls"
          ratio="1/1"
          caption={t.mediaCaption}
          autoPlay={false}
          className="intro-card-media"
        />
      </section>

      <section className="panel page-section" aria-labelledby="day-status">
        <h3 id="day-status" ref={statusRef} tabIndex={-1}>
          {orders.length === 0
            ? t.beforeStart
            : t.dayOf(Math.min(orders.length, MISSION_DAYS), MISSION_DAYS)}
        </h3>
        <CoreMeters result={result} hour={view.hour} />
        <p className="small">{t.science(Math.floor(view.scienceHours), k.scienceTargetHours)}</p>
      </section>

      {orders.length > 0 ? (
        <section className="page-section" aria-labelledby="day-news">
          <h3 id="day-news" className="card-title">
            {t.newsTitle(orders.length)}
          </h3>
          {view.news.length === 0 ? (
            <p>{t.quietDay}</p>
          ) : (
            <ul className="day-news" aria-live="polite">
              {view.news.map((e, i) => (
                <li key={`${e.t}-${i}`}>
                  <span className="muted small">{t.hour(e.t % 24)}</span> {newsLine(e)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {isOver ? (
        <section className="panel page-section day-end" aria-labelledby="day-end-title">
          <h3 id="day-end-title">{view.isLost ? t.lostTitle : t.wonTitle}</h3>
          <p>{view.isLost ? t.lostHint : result.scienceMet ? t.scienceMet : t.scienceMissed}</p>
          <p className="small muted">
            {t.yourOrders}: {orders.map((o) => t.orders[o].name).join(', ')}
          </p>
          <div className="button-row">
            <button type="button" className="btn-primary" onClick={() => restart(round)}>
              <Icon name="play" size={18} /> {t.again}
            </button>
            <button type="button" onClick={() => restart(round + 1)}>
              <Icon name="sun" size={18} /> {t.newMission}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="page-section" aria-labelledby="forecast-title">
            <h3 id="forecast-title" className="card-title">
              {t.forecastTitle}
            </h3>
            <ul className="day-forecast">
              <li>
                <Icon name={view.isDarkTomorrow ? 'warning' : 'sun'} size={18} />{' '}
                {view.isDarkTomorrow ? t.darkTomorrow : t.sunnyTomorrow}
              </li>
              <li className={view.isStormWarningHeard ? 'is-urgent' : undefined}>
                <Icon name="antenna" size={18} />{' '}
                {view.isStormWarningHeard ? t.stormHeard : t.noStormHeard}{' '}
                <span className="muted small">{t.radioDelay(MOON_DELAY_S)}</span>
              </li>
            </ul>
          </section>

          <form
            className="page-section"
            onSubmit={(e) => {
              e.preventDefault();
              runDay();
            }}
          >
            <fieldset className="day-orders">
              <legend className="card-title">{t.ordersLegend}</legend>
              {DAY_ORDERS.map((o) => {
                const c = t.orders[o];
                return (
                  <label key={o} className={`day-order${pick === o ? ' is-picked' : ''}`}>
                    <input
                      type="radio"
                      name="day-order"
                      value={o}
                      checked={pick === o}
                      onChange={() => setPick(o)}
                    />
                    <span className="day-order-name">{c.name}</span>{' '}
                    <span className="small">
                      <strong>{t.gain}</strong> {c.gain}
                    </span>{' '}
                    <span className="small">
                      <strong>{t.cost}</strong> {c.cost}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            <div className="button-row">
              <button type="submit" className="btn-primary btn-big">
                <Icon name="play" size={22} /> {t.run(orders.length + 1)}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
