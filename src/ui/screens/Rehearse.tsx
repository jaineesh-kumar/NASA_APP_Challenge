// Test (rehearse) screen: pick the real Sun, run the campaign in a worker (Spec B8, L7 AC1)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { useAppStore } from '../../state/store.tsx';
import { CAMPAIGN_RUNS, useCampaign } from '../../state/useCampaign.ts';
import { DataPanel } from '../components/DataPanel.tsx';
import { StormPicker, StormResultLine } from '../components/StormPicker.tsx';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const k = getSimConstants(loadParams());

export const RehearseScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const {
    design,
    rules,
    stormMode,
    isRunningCampaign,
    campaignProgress,
    campaignResult,
    campaignError,
    isResultStale,
  } = state;
  const { start } = useCampaign();
  const t = copy.rehearse;
  const pct = Math.round(campaignProgress * 100);
  const hasFreshResult = campaignResult !== null && !isResultStale;

  const rows: Array<[string, string, string?]> = [
    [t.site, design.site === 'ridge' ? copy.design.ridgeName : copy.design.craterName],
    [t.panels, `${design.panels} × ${k.panelKw} kW`, 'power.panel_kw'],
    [t.batteries, `${design.batteries} × ${k.batteryKwhPerUnit} kWh`, 'power.battery_kwh_per_unit'],
    [t.mast, String(design.mastLevel), 'power.mast_dark_reduction_per_level'],
    [t.water, design.waterLoopTier === 1 ? t.upgraded : t.basic, 'water.recovery_upgraded'],
    [t.o2, design.o2LoopTier === 1 ? 'Sabatier' : t.basic, 'o2.sabatier_recovery'],
    [t.shielding, String(design.shieldingLayers), 'radiation.shield_factor_by_layers'],
    [t.rulesCount, String(rules.ifThen.length)],
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 className="screen-title">{t.heading}</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        {t.subheading}
      </p>

      <section className="panel-card" aria-labelledby="base-summary">
        <h3 id="base-summary" className="card-title">
          {t.summaryTitle}
        </h3>
        <dl
          className="tiles"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}
        >
          {rows.map(([label, value, paramId]) => (
            <div key={label}>
              <dt className="muted small">{label}</dt>
              <dd style={{ fontWeight: 600 }}>
                {value}
                {paramId ? <WhyThisNumber paramId={paramId} /> : null}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <StormPicker
        value={stormMode}
        onChange={(mode) => dispatch({ type: 'SET_STORM_MODE', stormMode: mode })}
        disabled={isRunningCampaign}
      />

      <section
        className="panel-card"
        style={{ textAlign: 'center', padding: '32px 20px' }}
        aria-live="polite"
      >
        {campaignError && !isRunningCampaign ? (
          <div
            className="notice notice-danger"
            role="alert"
            style={{ textAlign: 'left', marginBottom: 16 }}
          >
            <strong>{t.errorTitle}</strong>
            <p>{t.errorBody(campaignError)}</p>
          </div>
        ) : null}

        {isRunningCampaign ? (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>{t.runningButton}</p>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.progressLabel}
              style={{
                maxWidth: 500,
                height: 14,
                margin: '0 auto 10px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)' }}
              />
            </div>
            <p className="muted small">
              {t.progressText(Math.round(campaignProgress * CAMPAIGN_RUNS), CAMPAIGN_RUNS)}
            </p>
          </div>
        ) : hasFreshResult ? (
          <div>
            {campaignResult ? (
              <div style={{ marginBottom: 16 }}>
                <StormResultLine
                  mode={campaignResult.stormMode}
                  survivalRate={campaignResult.survivalRate}
                  shieldLayers={design.shieldingLayers}
                  doseUsvP95={campaignResult.doseUsvP95}
                  doseLimitUsv={k.doseLimitUsv}
                  stormsPerRunMean={campaignResult.stormsPerRunMean}
                  stormsMaxInRun={campaignResult.stormsMaxInRun}
                />
              </div>
            ) : null}
            <p style={{ fontWeight: 600, color: 'var(--color-success)', marginBottom: 16 }}>
              ✓ {t.completedNotice}
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" onClick={start}>
                ↻ {t.rerunButton}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'review' })}
              >
                {t.proceedToReview}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={start}
            disabled={!state.isWithinBudget}
            style={{ fontSize: '1.15rem', padding: '14px 32px' }}
          >
            ▶ {t.runButton(CAMPAIGN_RUNS)}
          </button>
        )}
      </section>

      <DataPanel />

      <button type="button" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rules' })}>
        {t.backToRules}
      </button>
    </div>
  );
};
