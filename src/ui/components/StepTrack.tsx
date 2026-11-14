// The step track: an Earth-to-Moon route arc with the rocket at the current stop, and one coupon
// stub per step. Signature motion: the rocket glides along the arc when the step changes.

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
import { isStepDone, lockReason, STEPS, StepId } from '../flow.ts';
import { Icon } from './Icon.tsx';

const H = 150;
const GLIDE_MS = 700;
// On phones the arc is drawn on a narrower canvas so it stays tall enough to read.
const COMPACT_QUERY = '(max-width: 560px)';

interface Pt {
  x: number;
  y: number;
}

function geometry(isCompact: boolean) {
  const W = isCompact ? 560 : 1000;
  const P0: Pt = { x: W * 0.07, y: 112 }; // Earth
  const P1: Pt = { x: W * 0.5, y: -26 }; // arc control point
  const P2: Pt = { x: W * 0.93, y: 112 }; // Moon base
  const bezier = (t: number): Pt => {
    const u = 1 - t;
    return {
      x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x,
      y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y,
    };
  };
  const tangentDeg = (t: number) => {
    const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
    const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const arcPath = `M${P0.x},${P0.y} Q${P1.x},${P1.y} ${P2.x},${P2.y}`;
  return { W, P0, P2, bezier, tangentDeg, arcPath };
}

function useCompact(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
      const mq = window.matchMedia(COMPACT_QUERY);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => typeof window !== 'undefined' && window.matchMedia?.(COMPACT_QUERY).matches === true,
    () => false,
  );
}

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Animated position along the arc (0..1). */
function useGlide(target: number): number {
  const [t, setT] = useState(target);
  const from = useRef(target);
  const isStill = prefersReducedMotion() || typeof requestAnimationFrame === 'undefined';
  useEffect(() => {
    if (isStill) {
      from.current = target;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = easeOutExpo(Math.min(1, (now - start) / GLIDE_MS));
      const v = origin + (target - origin) * k;
      from.current = v;
      setT(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, isStill]);
  // Reduced motion: jump straight to the stop, no glide.
  return isStill ? target : t;
}

export const StepTrack: React.FC<{ current: StepId | null; furthest: number }> = ({
  current,
  furthest,
}) => {
  const { state, dispatch } = useAppStore();
  const last = STEPS.length - 1;
  const atIndex = current ? STEPS.indexOf(current) : Math.min(furthest, last);
  const t = useGlide(atIndex / last);
  const { W, P0, P2, bezier, tangentDeg, arcPath } = geometry(useCompact());
  const rocket = bezier(t);

  return (
    <nav aria-label={copy.nav.label} className="step-track">
      <svg
        className="route-arc"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={copy.flow.routeLabel}
      >
        {/* the whole route, dashed; the flown part, solid */}
        <path
          d={arcPath}
          fill="none"
          stroke="#9fb3dd"
          strokeWidth={4}
          strokeDasharray="2 12"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="var(--rocket)"
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${t} 1`}
        />
        {STEPS.map((s, i) => {
          const p = bezier(i / last);
          const isPast = i <= atIndex;
          return (
            <circle
              key={s}
              cx={p.x}
              cy={p.y}
              r={i === atIndex ? 9 : 7}
              fill={isPast ? 'var(--rocket)' : 'var(--coupon)'}
              stroke={isPast ? 'var(--rocket)' : '#9fb3dd'}
              strokeWidth={3}
            />
          );
        })}
        {/* Earth */}
        <g transform={`translate(${P0.x - 34} ${P0.y - 4})`}>
          <circle cx="0" cy="0" r="26" fill="#2a78d6" />
          <path
            d="M-14 -12c6-6 14-4 15 2s-6 6-4 12-8 8-12 2-5-11 1-16ZM8 6c5-2 11 1 10 6s-8 4-11 1-3-5 1-7Z"
            fill="#1baf7a"
          />
        </g>
        {/* Moon base */}
        <g transform={`translate(${P2.x + 34} ${P2.y - 4})`}>
          <circle cx="0" cy="0" r="26" fill="#e7ebf5" stroke="#9fb3dd" strokeWidth="3" />
          <circle cx="-8" cy="-7" r="5" fill="#c9d2e6" />
          <circle cx="9" cy="6" r="4" fill="#c9d2e6" />
          <path d="M-12 14h24v-6a12 12 0 0 0-24 0Z" fill="var(--navy)" />
        </g>
        <text x={P0.x - 34} y={H - 2} textAnchor="middle" fontSize="20">
          {copy.flow.earth}
        </text>
        <text x={P2.x + 34} y={H - 2} textAnchor="middle" fontSize="20">
          {copy.flow.moon}
        </text>
        {/* the rocket */}
        <g transform={`translate(${rocket.x} ${rocket.y}) rotate(${tangentDeg(t) + 90})`}>
          <g transform="translate(-16 -20) scale(1.35)" color="var(--navy)">
            <path
              d="M12 2.5c3.6 2.2 5.2 6 5 10.5l-2.5 3h-5L7 13c-.2-4.5 1.4-8.3 5-10.5Z"
              fill="var(--coupon)"
              stroke="var(--navy)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9" r="1.8" fill="var(--carbon)" />
            <path
              d="M9.5 16 7 19.5l3.2-.8M14.5 16l2.5 3.5-3.2-.8"
              fill="none"
              stroke="var(--navy)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10.6 17.5h2.8L12 22Z" fill="var(--sun)" />
          </g>
        </g>
      </svg>

      <ol className="stub-row">
        {STEPS.map((s, i) => {
          const reason = lockReason(s, state);
          const isDone = isStepDone(s, state, furthest);
          return (
            <li key={s}>
              <button
                type="button"
                className="stub"
                aria-current={current === s ? 'step' : undefined}
                disabled={reason !== null && current !== s}
                title={reason ?? undefined}
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: s })}
              >
                <span className="stub-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="stub-label">{copy.nav[s]}</span>
                {isDone ? (
                  <span className="done-stamp" aria-label={copy.flow.done}>
                    <Icon name="check" size={12} />
                    <span aria-hidden="true">{copy.flow.done}</span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
