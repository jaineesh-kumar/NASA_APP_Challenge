// IF-THEN automated rule editor
// Spec B5.2, Part C (L6 AC5)

import React, { useState } from 'react';
import { copy } from '../../content/copy.ts';
import { Action, Condition, IfThenRule, LoadId } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';

export const RuleEditor: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { ifThen } = state.rules;

  const [condKind, setCondKind] = useState<Condition['kind']>('battery_below_pct');
  const [condValue, setCondValue] = useState<number>(25);
  const [actKind, setActKind] = useState<Action['kind']>('shed');
  const [actLoad, setActLoad] = useState<LoadId>('science');

  const handleAddRule = () => {
    if (ifThen.length >= 5) return;

    let condition: Condition;
    if (condKind === 'battery_below_pct') {
      condition = { kind: 'battery_below_pct', value: condValue };
    } else if (condKind === 'o2_days_below') {
      condition = { kind: 'o2_days_below', value: condValue };
    } else if (condKind === 'dark_window_within_h') {
      condition = { kind: 'dark_window_within_h', value: condValue };
    } else if (condKind === 'spe_warning') {
      condition = { kind: 'spe_warning' };
    } else {
      condition = { kind: 'component_failed' };
    }

    let action: Action;
    if (actKind === 'shed') {
      action = { kind: 'shed', load: actLoad };
    } else {
      action = { kind: actKind };
    }

    dispatch({
      type: 'ADD_RULE',
      rule: { condition, action },
    });
  };

  const formatCondition = (c: Condition): string => {
    switch (c.kind) {
      case 'battery_below_pct':
        return `Battery drops below ${c.value}%`;
      case 'spe_warning':
        return 'Solar Particle Event warning is active';
      case 'o2_days_below':
        return `Oxygen reserves drop below ${c.value} days`;
      case 'dark_window_within_h':
        return `Dark window starts within ${c.value} hours`;
      case 'component_failed':
        return 'Any critical component breaks down';
    }
  };

  const formatAction = (a: Action): string => {
    switch (a.kind) {
      case 'shed':
        return `Shed load: ${copy.loads[a.load] ?? a.load}`;
      case 'shelter':
        return copy.actions.shelter;
      case 'repair_first':
        return copy.actions.repair_first;
      case 'greenhouse_low_power':
        return copy.actions.greenhouse_low_power;
      case 'pause_science':
        return copy.actions.pause_science;
    }
  };

  return (
    <div className="panel-card">
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '6px' }}>
        {copy.rules.ifThenTitle} ({ifThen.length} / 5)
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        {copy.rules.ifThenHelp}
      </p>

      {/* Rules list */}
      {ifThen.length === 0 ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {copy.rules.noRulesYet}
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
          aria-label="Configured automated rules"
        >
          {ifThen.map((rule: IfThenRule, index: number) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {copy.rules.ruleWhen}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {formatCondition(rule.condition)}
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--color-bg-highlight)',
                    color: 'var(--color-text-main)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {copy.rules.ruleThen}
                </span>
                <span style={{ color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                  {formatAction(rule.action)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_RULE', index })}
                aria-label={`Remove rule ${index + 1}`}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  backgroundColor: 'transparent',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-danger)',
                }}
              >
                ✕ {copy.rules.removeRule}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Rule Creator */}
      {ifThen.length < 5 ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-bg-base)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
            Add New Rule
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label
                htmlFor="rule-condition-select"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '4px',
                }}
              >
                Condition
              </label>
              <select
                id="rule-condition-select"
                value={condKind}
                onChange={(e) => setCondKind(e.target.value as Condition['kind'])}
                style={{ width: '100%' }}
              >
                <option value="battery_below_pct">{copy.conditions.battery_below_pct}</option>
                <option value="spe_warning">{copy.conditions.spe_warning}</option>
                <option value="o2_days_below">{copy.conditions.o2_days_below}</option>
                <option value="dark_window_within_h">{copy.conditions.dark_window_within_h}</option>
                <option value="component_failed">{copy.conditions.component_failed}</option>
              </select>
            </div>

            {(condKind === 'battery_below_pct' ||
              condKind === 'o2_days_below' ||
              condKind === 'dark_window_within_h') && (
              <div>
                <label
                  htmlFor="rule-condition-value"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Threshold Value
                </label>
                <input
                  id="rule-condition-value"
                  type="number"
                  value={condValue}
                  onChange={(e) => setCondValue(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="rule-action-select"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '4px',
                }}
              >
                Action
              </label>
              <select
                id="rule-action-select"
                value={actKind}
                onChange={(e) => setActKind(e.target.value as Action['kind'])}
                style={{ width: '100%' }}
              >
                <option value="shed">{copy.actions.shed}</option>
                <option value="shelter">{copy.actions.shelter}</option>
                <option value="repair_first">{copy.actions.repair_first}</option>
                <option value="greenhouse_low_power">{copy.actions.greenhouse_low_power}</option>
                <option value="pause_science">{copy.actions.pause_science}</option>
              </select>
            </div>

            {actKind === 'shed' && (
              <div>
                <label
                  htmlFor="rule-action-load-select"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Load to Shed
                </label>
                <select
                  id="rule-action-load-select"
                  value={actLoad}
                  onChange={(e) => setActLoad(e.target.value as LoadId)}
                  style={{ width: '100%' }}
                >
                  <option value="science">{copy.loads.science}</option>
                  <option value="construction">{copy.loads.construction}</option>
                  <option value="greenhouse">{copy.loads.greenhouse}</option>
                  <option value="comms">{copy.loads.comms}</option>
                  <option value="thermal">{copy.loads.thermal}</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
            }}
          >
            {copy.rules.addRuleButton}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          {copy.rules.maxRulesReached}
        </div>
      )}
    </div>
  );
};
