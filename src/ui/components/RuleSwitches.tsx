// Junior Mode's three ready-made safety switches (B10.7, L11 AC4). Each switch adds or removes
// one exact IF-THEN rule, so Planner Mode shows the same rules in the full editor.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { IfThenRule } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';

export const SWITCH_RULES: ReadonlyArray<{
  id: 'batteryLow' | 'storm' | 'broken';
  rule: IfThenRule;
}> = [
  {
    id: 'batteryLow',
    rule: {
      condition: { kind: 'battery_below_pct', value: 30 },
      action: { kind: 'greenhouse_low_power' },
    },
  },
  { id: 'storm', rule: { condition: { kind: 'spe_warning' }, action: { kind: 'shelter' } } },
  {
    id: 'broken',
    rule: { condition: { kind: 'component_failed' }, action: { kind: 'repair_first' } },
  },
];

const sameKind = (a: IfThenRule, b: IfThenRule) =>
  a.condition.kind === b.condition.kind && a.action.kind === b.action.kind;

export const RuleSwitches: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const s = copy.switches;
  return (
    <section className="panel-card" aria-labelledby="switches-title">
      <h3 id="switches-title" className="card-title">
        {s.title}
      </h3>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {s.intro}
      </p>
      <ul className="switch-list">
        {SWITCH_RULES.map(({ id, rule }) => {
          const index = state.rules.ifThen.findIndex((r) => sameKind(r, rule));
          const isOn = index >= 0;
          return (
            <li key={id}>
              <button
                type="button"
                role="switch"
                aria-checked={isOn}
                className="switch"
                onClick={() =>
                  isOn
                    ? dispatch({ type: 'REMOVE_RULE', index })
                    : dispatch({ type: 'ADD_RULE', rule })
                }
              >
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-thumb" />
                </span>
                <span className="switch-label">{s[id]}</span>
                <span className="switch-state">{isOn ? s.on : s.off}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
