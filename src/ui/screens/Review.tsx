// Review: survival and success with Wilson ranges, margins, causes, real Sun, replay, cause chain
// Spec B5.7, B5.9, B8; L7 AC2-AC6

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { useAppStore } from '../../state/store.tsx';
import { ConceptHintBox } from '../components/ConceptHintBox.tsx';
import { MassVsRiskChart } from '../components/MassVsRiskChart.tsx';
import { HundredGrid } from '../components/HundredGrid.tsx';
import { MissionPass } from '../components/MissionPass.tsx';
import { ReplayTimeline } from '../components/ReplayTimeline.tsx';
import { RiskBarChart } from '../components/RiskBarChart.tsx';
import { findStorm, StormResultLine } from '../components/StormPicker.tsx';
import { getDonkiArchive } from '../../engine/params.ts';
import { FailureCause } from '../../engine/types.ts';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const params = loadParams();
const k = getSimConstants(params);

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

  const isJunior = state.mode === 'junior';
  const causes: FailureCause[] = ['oxygen', 'co2', 'water', 'food', 'dose'];
  const top = causes.reduce<FailureCause | null>(
    (best, cause) => (c.causeCounts[cause] > (best ? c.causeCounts[best] : 0) ? cause : best),
    null,
  );
  const kindLine = top ? copy.kind.trouble(copy.causes[top]) : copy.kind.allHome;
  // New challenge: replay the next real storm in the archive (B10.7 replayability).
  const newChallenge = () => {
    const events = getDonkiArchive().events;
    const current = findStorm(c.stormMode);
    const i = current ? events.findIndex((e) => e.id === current.id) : -1;
    const next = events[(i + 1) % events.length];
    if (next) dispatch({ type: 'SET_STORM_MODE', stormMode: { kind: 'replay', eventId: next.id } });
    dispatch({ type: 'SET_SCREEN', screen: 'rehearse' });
  };

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

      <MissionPass result={c} showRanges={!isJunior} />
      {isJunior ? (
        <section className="kind" aria-label={copy.hundred.label(Math.round(c.survivalRate * 100))}>
          <HundredGrid home={Math.round(c.survivalRate * 100)} />
          <p className="kind-text">{kindLine}</p>
          <div className="row">
            <button type="button" onClick={newChallenge}>
              {copy.kind.newChallenge}
            </button>
          </div>
        </section>
      ) : null}

      {isJunior ? (
        <details className="more-options">
          <summary>{copy.kind.moreDetails}</summary>
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

          <section className="panel-card" aria-labelledby="storms-title">
            <h3 id="storms-title" className="card-title">
              {t.stormsTitle}
            </h3>
            <StormResultLine
              mode={c.stormMode}
              survivalRate={c.survivalRate}
              shieldLayers={state.design.shieldingLayers}
              doseUsvP95={c.doseUsvP95}
              doseLimitUsv={k.doseLimitUsv}
              stormsPerRunMean={c.stormsPerRunMean}
              stormsMaxInRun={c.stormsMaxInRun}
            />
          </section>

          <div className="grid-2col">
            <RiskBarChart causeCounts={c.causeCounts} totalRuns={c.runs} />
            <MassVsRiskChart history={history} />
          </div>
        </details>
      ) : (
        <>
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

          <section className="panel-card" aria-labelledby="storms-title">
            <h3 id="storms-title" className="card-title">
              {t.stormsTitle}
            </h3>
            <StormResultLine
              mode={c.stormMode}
              survivalRate={c.survivalRate}
              shieldLayers={state.design.shieldingLayers}
              doseUsvP95={c.doseUsvP95}
              doseLimitUsv={k.doseLimitUsv}
              stormsPerRunMean={c.stormsPerRunMean}
              stormsMaxInRun={c.stormsMaxInRun}
            />
          </section>

          <div className="grid-2col">
            <RiskBarChart causeCounts={c.causeCounts} totalRuns={c.runs} />
            <MassVsRiskChart history={history} />
          </div>
        </>
      )}

      <ReplayTimeline
        key={`${worst.seed}-${history.length}`}
        worstResult={worst}
        stormMode={c.stormMode}
        isJunior={isJunior}
      />
      <ConceptHintBox worstResult={worst} />
    </div>
  );
};
