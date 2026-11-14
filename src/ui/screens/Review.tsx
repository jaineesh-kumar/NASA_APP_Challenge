// Review: survival and success with Wilson ranges, margins, causes, real Sun, replay, cause chain
// Spec B5.7, B5.9, B8; L7 AC2-AC6

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { Interval } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';
import { ConceptHintBox } from '../components/ConceptHintBox.tsx';
import { MassVsRiskChart } from '../components/MassVsRiskChart.tsx';
import { ReplayTimeline } from '../components/ReplayTimeline.tsx';
import { RiskBarChart } from '../components/RiskBarChart.tsx';
import { eraName } from '../components/SpaceWeatherPanel.tsx';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const params = loadParams();
const k = getSimConstants(params);
const budget = params.getNumber('mass.budget');
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const range = (ci: Interval) => `${pct(ci.low)} – ${pct(ci.high)}`;

export const ReviewScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { campaignResult: c, worstMissionResult: worst, isResultStale, history } = state;
  const t = copy.review;

  if (!c || !worst) {
    return (
      <section className="panel-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 className="screen-title">{t.noResultsTitle}</h2>
        <p className="muted" style={{ margin: '8px 0 20px' }}>
          {t.noResultsBody}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rehearse' })}
        >
          {t.goTest}
        </button>
      </section>
    );
  }

  const isReady = c.rating === 'flight_ready';
  const survTarget = Math.round(k.flightReadySurvival * 100);
  const succTarget = Math.round(k.flightReadySuccess * 100);

  return (
    <div>
      <h2 className="screen-title">{t.heading}</h2>
      <p className="muted" style={{ marginBottom: 16 }}>
        {t.subheading}
      </p>

      {isResultStale ? (
        <p className="notice" role="status" style={{ marginBottom: 16 }}>
          {t.staleNotice}
        </p>
      ) : null}

      <section
        className="panel-card"
        role="status"
        style={{
          borderLeft: `6px solid ${isReady ? 'var(--color-success)' : 'var(--color-warning)'}`,
          background: isReady ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
        }}
      >
        <h3
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: isReady ? 'var(--color-success)' : 'var(--color-warning)',
          }}
        >
          {isReady ? `🚀 ${t.flightReadyTitle}` : `⚠️ ${t.needsWorkTitle}`}
          <WhyThisNumber paramId="rating.flight_ready_survival" />
        </h3>
        <p>
          {isReady
            ? t.flightReadyDesc(survTarget, succTarget)
            : t.needsWorkDesc(survTarget, succTarget)}
        </p>
      </section>

      <div className="tiles" style={{ marginBottom: 24 }}>
        <div className="tile">
          <div className="tile-label">{t.survivalRateTitle}</div>
          <div className="tile-value">{pct(c.survivalRate)}</div>
          <div className="small muted" title={t.confidenceHelp}>
            {t.confidenceIntervalLabel}: {range(c.survivalCi)}
          </div>
        </div>
        <div className="tile">
          <div className="tile-label">
            {t.successRateTitle}
            <WhyThisNumber paramId="science.target_hours" />
          </div>
          <div className="tile-value">{pct(c.successRate)}</div>
          <div className="small muted" title={t.confidenceHelp}>
            {t.confidenceIntervalLabel}: {range(c.successCi)}
          </div>
        </div>
        <div className="tile">
          <div className="tile-label">
            {t.massUsedTitle}
            <WhyThisNumber paramId="mass.budget" />
          </div>
          <div className="tile-value">{t.massOf(c.massUsed, budget)}</div>
        </div>
      </div>
      <p className="muted small" style={{ marginTop: -16, marginBottom: 24 }}>
        {t.confidenceHelp}
      </p>

      <section className="panel-card" aria-labelledby="margins-title">
        <h3 id="margins-title" className="card-title">
          {t.marginsTitle}
        </h3>
        <div className="tiles">
          <div className="tile">
            <div className="tile-label">
              {t.batteryP5Label}
              <WhyThisNumber paramId="power.battery_kwh_per_unit" />
            </div>
            <div className="tile-value">{c.minBatteryPctP5.toFixed(0)}%</div>
          </div>
          <div className="tile">
            <div className="tile-label">
              {t.o2P5Label}
              <WhyThisNumber paramId="start.o2_tank_kg" />
            </div>
            <div className="tile-value">
              {c.minO2DaysP5.toFixed(1)} {t.days}
            </div>
          </div>
          <div className="tile">
            <div className="tile-label">
              {t.doseP95Label}
              <WhyThisNumber paramId="radiation.dose_limit_usv_mission" />
            </div>
            <div className="tile-value">{Math.round(c.doseUsvP95).toLocaleString()} µSv</div>
            <div className="small muted">{t.doseLimit(k.doseLimitUsv.toLocaleString())}</div>
          </div>
        </div>
      </section>

      <section className="panel-card" aria-labelledby="sun-title">
        <h3 id="sun-title" className="card-title">
          {t.sunTitle}
        </h3>
        <p>{t.sunSummary(eraName(c.sunEra), c.stormsPerRunMean.toFixed(1), c.stormsMaxInRun)}</p>
        <p className={c.warningsMissed > 0 ? 'notice' : 'muted'} style={{ marginTop: 8 }}>
          {t.warningsMissed(c.warningsMissed)}
        </p>
      </section>

      <div className="grid-2col">
        <RiskBarChart causeCounts={c.causeCounts} totalRuns={c.runs} />
        <MassVsRiskChart history={history} />
      </div>

      <ReplayTimeline key={`${worst.seed}-${history.length}`} worstResult={worst} />
      <ConceptHintBox worstResult={worst} />

      <div className="row-between" style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'design' })}
        >
          {t.redesignButton}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rehearse' })}>
          ↻ {t.rerunButton}
        </button>
      </div>
    </div>
  );
};
