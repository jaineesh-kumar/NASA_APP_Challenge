// Tabs for the parts of a step (WAI-ARIA tabs pattern). Every panel stays mounted and inactive
// panels are `hidden`, so a running replay or a half-made rule keeps its state when you switch.

import React, { useId, useRef, useState } from 'react';

export interface SectionTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export const SectionTabs: React.FC<{ label: string; tabs: readonly SectionTab[] }> = ({
  label,
  tabs,
}) => {
  const base = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = Math.min(active, tabs.length - 1);

  const focusTab = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight') focusTab(i + 1);
    else if (e.key === 'ArrowLeft') focusTab(i - 1);
    else if (e.key === 'Home') focusTab(0);
    else if (e.key === 'End') focusTab(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="section-tabs">
      <div className="section-tab-list" role="tablist" aria-label={label}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={i === current}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={i === current ? 0 : -1}
            className="section-tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          className="section-tab-panel"
          hidden={i !== current}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
