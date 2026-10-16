// Interactive Replay Timeline scrubbing across 720 ticks of worst-case run
// Spec B1, B4.9, Part C (L7 AC5)

import React, { useState } from 'react';
import { copy } from '../../content/copy.ts';
import { LogEntry, MissionResult } from '../../engine/types.ts';

interface ReplayTimelineProps {
  worstResult: MissionResult;
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({ worstResult }) => {
  const [currentHour, setCurrentHour] = useState<number>(
    worstResult.failureHour ?? Math.min(719, 360),
  );

  const logsAtHour = worstResult.log.filter((l) => l.t === currentHour);
  const recentLogs = worstResult.log.filter(
    (l) => l.t <= currentHour && l.t >= Math.max(0, currentHour - 24),
  );

  // Group events for visual tick markers
  const darkStarts = worstResult.log.filter((l) => l.type === 'dark_window_start').map((l) => l.t);
  const dustStarts = worstResult.log.filter((l) => l.type === 'dust_start').map((l) => l.t);
  const speStarts = worstResult.log.filter((l) => l.type === 'spe_start').map((l) => l.t);
  const failures = worstResult.log.filter((l) => l.type === 'component_failed').map((l) => l.t);
  const fatalLoss = worstResult.log.find((l) => l.type === 'failure');

  const timelineWidth = 600;
  const toX = (t: number) => (t / 720) * timelineWidth;

  return (
    <div className="panel-card" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
        {copy.review.replayTitle}
        {worstResult.seed})
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Step through hourly events of this mission to inspect the cascade leading to loss or recovery.
      </p>

      {/* SVG Overview Ribbon */}
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <svg
          width="100%"
          height="60"
          viewBox={`0 0 ${timelineWidth} 60`}
          role="img"
          aria-label="Overview timeline bar showing event markers across 720 hours"
          style={{ display: 'block', backgroundColor: 'var(--color-bg-base)', borderRadius: '6px' }}
        >
          <title>720-Hour Mission Overview</title>
          {/* Base timeline axis */}
          <line x1="0" y1="30" x2={timelineWidth} y2="30" stroke="var(--color-border)" strokeWidth="2" />

          {/* Dark Windows */}
          {darkStarts.map((t, idx) => (
            <line
              key={`dark-${idx}`}
              x1={toX(t)}
              y1="10"
              x2={toX(t)}
              y2="50"
              stroke="#64748b"
              strokeWidth="4"
              strokeOpacity="0.8"
            />
          ))}

          {/* Dust Events */}
          {dustStarts.map((t, idx) => (
            <circle key={`dust-${idx}`} cx={toX(t)} cy="30" r="4" fill="#f59e0b" />
          ))}

          {/* SPE Events */}
          {speStarts.map((t, idx) => (
            <circle key={`spe-${idx}`} cx={toX(t)} cy="20" r="5" fill="#f43f5e" />
          ))}

          {/* Component Failures */}
          {failures.map((t, idx) => (
            <rect key={`fail-${idx}`} x={toX(t) - 3} y="27" width="6" height="6" fill="#fb923c" />
          ))}

          {/* Fatal loss */}
          {fatalLoss && (
            <line
              x1={toX(fatalLoss.t)}
              y1="0"
              x2={toX(fatalLoss.t)}
              y2="60"
              stroke="var(--color-danger)"
              strokeWidth="3"
            />
          )}

          {/* Scrubber indicator */}
          <circle
            cx={toX(currentHour)}
            cy="30"
            r="7"
            fill="var(--color-primary)"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Scrubber Input */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <label htmlFor="replay-scrubber" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {copy.review.scrubberLabel}
          </label>
          <span
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              fontSize: '1rem',
            }}
          >
            Hour {currentHour} / 720 (Day {Math.floor(currentHour / 24) + 1})
          </span>
        </div>

        <input
          id="replay-scrubber"
          type="range"
          min="0"
          max="719"
          value={currentHour}
          onChange={(e) => setCurrentHour(Number(e.target.value))}
          aria-label="Mission hour replay scrubber"
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      {/* Log Feed at this Hour */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
          Events Occurred at Hour {currentHour}:
        </div>

        {logsAtHour.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Routine nominal outpost operations; all active subsystems stable.
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {logsAtHour.map((log: LogEntry, idx: number) => {
              const isAlert =
                log.type === 'failure' || log.type === 'component_failed' || log.type === 'battery_empty';
              return (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.85rem',
                    color: isAlert ? 'var(--color-danger)' : 'var(--color-text-main)',
                    fontWeight: isAlert ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: '0.75rem',
                      padding: '1px 4px',
                      backgroundColor: 'var(--color-bg-surface-elevated)',
                      borderRadius: '3px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {log.type}
                  </span>
                  <span>{log.detail}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Trailing 24h event history */}
      {recentLogs.length > 0 && (
        <details style={{ marginTop: '12px', fontSize: '0.85rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            Show Preceding 24 Hours Event Log ({recentLogs.length} events)
          </summary>
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              marginTop: '8px',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.8rem',
            }}
          >
            {recentLogs.map((l, i) => (
              <div key={i} style={{ padding: '2px 0', color: 'var(--color-text-muted)' }}>
                [T={l.t}h] {l.type}: {l.detail}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
