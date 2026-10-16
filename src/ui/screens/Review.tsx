// Review screen displaying campaign results, Wilson intervals, margins, and charts
// Spec B1, B5.7, B5.8, B5.9, Part C (L7 AC2, AC3, AC4, AC5, AC6)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { Interval } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';
import { ConceptHintBox } from '../components/ConceptHintBox.tsx';
import { MassVsRiskChart } from '../components/MassVsRiskChart.tsx';
import { ReplayTimeline } from '../components/ReplayTimeline.tsx';
import { RiskBarChart } from '../components/RiskBarChart.tsx';

export const ReviewScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { campaignResult, worstMissionResult, massUsed } = state;

  if (!campaignResult || !worstMissionResult) {
    return (
      <div className="panel-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>No Campaign Results Yet</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Please execute a 300-run mission rehearsal first to generate statistical margins.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rehearse' })}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 24px',
            fontWeight: 600,
          }}
        >
          Go to Rehearsal →
        </button>
      </div>
    );
  }

  const isFlightReady = campaignResult.rating === 'flight_ready';
  const formatCi = (ci: Interval) =>
    `[${(ci.low * 100).toFixed(1)}%, ${(ci.high * 100).toFixed(1)}%]`;

  const survivalPct = (campaignResult.survivalRate * 100).toFixed(1);
  const successPct = (campaignResult.successRate * 100).toFixed(1);
  const riskPct = (1 - campaignResult.survivalRate) * 100;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          {copy.review.heading}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          {copy.review.subheading}
        </p>
      </div>

      {/* Flight Ready / Needs Revision Rating Banner (AC2) */}
      <div
        className="panel-card"
        style={{
          borderLeft: `6px solid ${isFlightReady ? 'var(--color-success)' : 'var(--color-warning)'}`,
          backgroundColor: isFlightReady ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.5rem' }}>{isFlightReady ? '🚀' : '⚠️'}</span>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: isFlightReady ? 'var(--color-success)' : 'var(--color-warning)',
              letterSpacing: '0.04em',
            }}
          >
            {isFlightReady ? copy.review.flightReadyTitle : copy.review.needsWorkTitle}
          </h3>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
          {isFlightReady ? copy.review.flightReadyDesc : copy.review.needsWorkDesc}
        </p>
      </div>

      {/* Primary Metrics Grid (AC3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Survival Rate Card */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            {copy.review.survivalRateTitle}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
            }}
          >
            {survivalPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {copy.review.confidenceIntervalLabel}:{' '}
            <strong style={{ color: 'var(--color-text-main)' }}>
              {formatCi(campaignResult.survivalCi)}
            </strong>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            {copy.review.successRateTitle}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
            }}
          >
            {successPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {copy.review.confidenceIntervalLabel}:{' '}
            <strong style={{ color: 'var(--color-text-main)' }}>
              {formatCi(campaignResult.successCi)}
            </strong>
          </div>
        </div>

        {/* Mass Card */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            {copy.review.massUsedTitle}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--color-text-main)',
            }}
          >
            {massUsed} / 120 mu
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Payload Budget Utilized: {Math.round((massUsed / 120) * 100)}%
          </div>
        </div>
      </div>

      {/* Subsystem Margins Card */}
      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
          {copy.review.marginsTitle}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            fontSize: '0.9rem',
          }}
        >
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
              {copy.review.batteryP5Label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color:
                  campaignResult.minBatteryPctP5 > 10 ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {campaignResult.minBatteryPctP5.toFixed(1)}%
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
              {copy.review.o2P5Label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color:
                  campaignResult.minO2DaysP5 > 5 ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {campaignResult.minO2DaysP5.toFixed(1)} days
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
              {copy.review.doseP95Label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color:
                  campaignResult.doseUsvP95 < 60000 ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {Math.round(campaignResult.doseUsvP95).toLocaleString()} µSv
            </div>
          </div>
        </div>
      </div>

      {/* SVG Charts Row */}
      <div className="grid-2col">
        <RiskBarChart causeCounts={campaignResult.causeCounts} totalRuns={campaignResult.runs} />
        <MassVsRiskChart currentMass={massUsed} currentRiskPct={riskPct} />
      </div>

      {/* Replay Timeline and Cause Chain */}
      <ReplayTimeline worstResult={worstMissionResult} />
      <ConceptHintBox worstResult={worstMissionResult} />

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
        }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'design' })}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 24px',
            fontWeight: 600,
          }}
        >
          {copy.review.redesignButton}
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rehearse' })}
          style={{ padding: '10px 20px' }}
        >
          ↻ Re-run Simulation
        </button>
      </div>
    </div>
  );
};
