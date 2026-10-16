// Rehearse screen executing 300-run Monte Carlo campaign
// Spec B1, B5.7, Part C (L7 AC1)

import React, { useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { runCampaign } from '../../engine/montecarlo.ts';
import { loadParams } from '../../engine/params.ts';
import { runMission } from '../../engine/sim.ts';
import { useAppStore } from '../../state/store.tsx';
import { WorkerIncomingMessage, WorkerOutgoingMessage } from '../../worker/campaign.worker.ts';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const params = loadParams();

export const RehearseScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { design, rules, isRunningCampaign, campaignProgress, campaignResult } = state;

  const [statusMessage, setStatusMessage] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);

  const startRehearsal = () => {
    dispatch({ type: 'START_CAMPAIGN' });
    setStatusMessage('Spawning campaign worker...');

    try {
      if (typeof window !== 'undefined' && window.Worker) {
        // Instantiate campaign worker
        const worker = new Worker(new URL('../../worker/campaign.worker.ts', import.meta.url), {
          type: 'module',
        });
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<WorkerOutgoingMessage>) => {
          const msg = event.data;
          if (msg.type === 'PROGRESS') {
            dispatch({ type: 'SET_CAMPAIGN_PROGRESS', progress: msg.progress });
            setStatusMessage(`Simulated ${Math.round(msg.progress * 300)} of 300 missions...`);
          } else if (msg.type === 'RESULT') {
            const worstRun = runMission(design, rules, msg.result.worstSeed, params);
            dispatch({
              type: 'SET_CAMPAIGN_RESULT',
              result: msg.result,
              worstRun,
            });
            setStatusMessage(copy.rehearse.completedNotice);
            worker.terminate();
            workerRef.current = null;
          } else if (msg.type === 'ERROR') {
            runFallbackSynchronously();
          }
        };

        worker.onerror = () => {
          runFallbackSynchronously();
        };

        const payload: WorkerIncomingMessage = {
          type: 'RUN_CAMPAIGN',
          design,
          rules,
          runs: 300,
        };
        worker.postMessage(payload);
      } else {
        runFallbackSynchronously();
      }
    } catch {
      runFallbackSynchronously();
    }
  };

  const runFallbackSynchronously = () => {
    setStatusMessage('Executing simulation campaign...');
    // Small timeout to allow UI render
    setTimeout(() => {
      const result = runCampaign(design, rules, 300, params, (progress) => {
        dispatch({ type: 'SET_CAMPAIGN_PROGRESS', progress });
      });
      const worstRun = runMission(design, rules, result.worstSeed, params);
      dispatch({
        type: 'SET_CAMPAIGN_RESULT',
        result,
        worstRun,
      });
      setStatusMessage(copy.rehearse.completedNotice);
    }, 50);
  };

  const progressPct = Math.round(campaignProgress * 100);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          {copy.rehearse.heading}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          {copy.rehearse.subheading}
        </p>
      </div>

      {/* Outpost Summary Card */}
      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
          {copy.rehearse.summaryTitle}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Site: </span>
            <span style={{ fontWeight: 600 }}>
              {design.site === 'ridge' ? 'Malapert Ridge' : 'Shackleton Edge'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Solar Panels: </span>
            <span style={{ fontWeight: 600 }}>
              {design.panels} ({design.panels * 10} kW)
            </span>
            <WhyThisNumber paramId="power.panel_kw" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Batteries: </span>
            <span style={{ fontWeight: 600 }}>
              {design.batteries} ({design.batteries * 100} kWh)
            </span>
            <WhyThisNumber paramId="power.battery_kwh_per_unit" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Mast Level: </span>
            <span style={{ fontWeight: 600 }}>{design.mastLevel}</span>
            <WhyThisNumber paramId="power.mast_dark_reduction_per_level" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Water Loop: </span>
            <span style={{ fontWeight: 600 }}>
              {design.waterLoopTier === 1 ? '98% (Brine)' : '90% (Base)'}
            </span>
            <WhyThisNumber paramId="water.recovery_upgraded" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>O2 Loop: </span>
            <span style={{ fontWeight: 600 }}>
              {design.o2LoopTier === 1 ? 'Sabatier Reactor' : 'Stored Tanks'}
            </span>
            <WhyThisNumber paramId="o2.sabatier_recovery" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Shielding Layers: </span>
            <span style={{ fontWeight: 600 }}>{design.shieldingLayers}</span>
            <WhyThisNumber paramId="radiation.shield_factor_by_layers" />
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Automated Rules: </span>
            <span style={{ fontWeight: 600 }}>{rules.ifThen.length}</span>
          </div>
        </div>
      </div>

      {/* Campaign Launcher and Progress */}
      <div
        className="panel-card"
        style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '24px' }}
      >
        {!isRunningCampaign && !campaignResult && (
          <button
            type="button"
            onClick={startRehearsal}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontSize: '1.15rem',
              fontWeight: 700,
              padding: '14px 32px',
              border: 'none',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            ▶ {copy.rehearse.runButton}
          </button>
        )}

        {isRunningCampaign && (
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '12px' }}>
              {copy.rehearse.runningButton}
            </div>

            <div
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={copy.rehearse.progressLabel}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: '14px',
                backgroundColor: 'var(--color-bg-base)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                margin: '0 auto 12px auto',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.15s ease',
                }}
              />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
              }}
            >
              {statusMessage || `${progressPct}%`}
            </div>
          </div>
        )}

        {campaignResult && !isRunningCampaign && (
          <div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--color-success)',
                marginBottom: '16px',
              }}
            >
              ✓ {copy.rehearse.completedNotice}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={startRehearsal}
                style={{ padding: '10px 20px', fontSize: '0.95rem' }}
              >
                ↻ Re-run Campaign
              </button>

              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'review' })}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {copy.rehearse.proceedToReview}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rules' })}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          {copy.rehearse.backToRules}
        </button>
      </div>
    </div>
  );
};
