// Outpost Design screen
// Spec B5.2, Part C (L6 AC1, AC2, AC3, AC6)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { missionPresets } from '../../content/missions.ts';
import { useAppStore } from '../../state/store.tsx';
import { MassBudgetBar } from '../components/MassBudgetBar.tsx';
import { NumberStepper } from '../components/NumberStepper.tsx';
import { SegmentedControl } from '../components/SegmentedControl.tsx';

export const DesignScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { design, isWithinBudget } = state;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          {copy.design.heading}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          {copy.design.subheading}
        </p>
      </div>

      {/* Mass Budget Bar */}
      <MassBudgetBar />

      {/* Preset Pickers */}
      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
          {copy.design.presetsTitle}
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {missionPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_PRESET', preset })}
              style={{
                textAlign: 'left',
                padding: '8px 14px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 600 }}>{preset.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {preset.tagline}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        {/* Column 1: Site and Power */}
        <div>
          <div className="panel-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '12px' }}>
              {copy.design.siteTitle}
            </h3>
            <SegmentedControl
              label="Select Landing Location"
              options={[
                {
                  value: 'ridge',
                  label: copy.design.ridgeName,
                  sublabel: copy.design.ridgeDesc,
                },
                {
                  value: 'crater_edge',
                  label: copy.design.craterName,
                  sublabel: copy.design.craterDesc,
                },
              ]}
              value={design.site}
              onChange={(site) => dispatch({ type: 'SET_SITE', site })}
            />
          </div>

          <div className="panel-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '12px' }}>
              {copy.design.powerSectionTitle}
            </h3>

            <NumberStepper
              label={copy.design.panelsLabel}
              helpText={copy.design.panelsHelp}
              value={design.panels}
              min={1}
              max={8}
              onChange={(panels) => dispatch({ type: 'SET_PANELS', panels })}
            />

            <NumberStepper
              label={copy.design.mastLabel}
              helpText={copy.design.mastHelp}
              value={design.mastLevel}
              min={0}
              max={3}
              onChange={(mastLevel) =>
                dispatch({ type: 'SET_MAST', mastLevel: mastLevel as 0 | 1 | 2 | 3 })
              }
            />

            <NumberStepper
              label={copy.design.batteriesLabel}
              helpText={copy.design.batteriesHelp}
              value={design.batteries}
              min={1}
              max={12}
              onChange={(batteries) => dispatch({ type: 'SET_BATTERIES', batteries })}
            />
          </div>
        </div>

        {/* Column 2: Life Support, Shielding, and Spares */}
        <div>
          <div className="panel-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '12px' }}>
              {copy.design.lifeSupportSectionTitle}
            </h3>

            <SegmentedControl
              label={copy.design.waterLoopLabel}
              options={[
                { value: 0, label: 'Base Loop', sublabel: copy.design.waterLoopBase },
                { value: 1, label: 'Brine Upgrade', sublabel: copy.design.waterLoopUpgraded },
              ]}
              value={design.waterLoopTier}
              onChange={(tier) => dispatch({ type: 'SET_WATER_TIER', tier })}
            />

            <SegmentedControl
              label={copy.design.o2LoopLabel}
              options={[
                { value: 0, label: 'Standard Tank', sublabel: copy.design.o2LoopBase },
                { value: 1, label: 'Sabatier Loop', sublabel: copy.design.o2LoopSabatier },
              ]}
              value={design.o2LoopTier}
              onChange={(tier) => dispatch({ type: 'SET_O2_TIER', tier })}
            />

            <NumberStepper
              label={copy.design.greenhouseLabel}
              helpText={copy.design.greenhouseHelp}
              value={design.greenhouseModules}
              min={0}
              max={3}
              onChange={(modules) =>
                dispatch({
                  type: 'SET_GREENHOUSE',
                  modules: modules as 0 | 1 | 2 | 3,
                })
              }
            />

            <NumberStepper
              label={copy.design.shieldingLabel}
              helpText={copy.design.shieldingHelp}
              value={design.shieldingLayers}
              min={0}
              max={3}
              onChange={(layers) =>
                dispatch({
                  type: 'SET_SHIELDING',
                  layers: layers as 0 | 1 | 2 | 3,
                })
              }
            />
          </div>

          <div className="panel-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px' }}>
              {copy.design.sparesSectionTitle}
            </h3>
            <p
              style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}
            >
              {copy.design.sparesHelp}
            </p>

            <NumberStepper
              label={copy.design.co2ScrubberSpares}
              value={design.spares.co2_scrubber}
              min={0}
              max={2}
              onChange={(count) =>
                dispatch({
                  type: 'SET_SPARE',
                  component: 'co2_scrubber',
                  count: count as 0 | 1 | 2,
                })
              }
            />

            <NumberStepper
              label={copy.design.o2GenSpares}
              value={design.spares.o2_generator}
              min={0}
              max={2}
              onChange={(count) =>
                dispatch({
                  type: 'SET_SPARE',
                  component: 'o2_generator',
                  count: count as 0 | 1 | 2,
                })
              }
            />

            <NumberStepper
              label={copy.design.waterProcSpares}
              value={design.spares.water_processor}
              min={0}
              max={2}
              onChange={(count) =>
                dispatch({
                  type: 'SET_SPARE',
                  component: 'water_processor',
                  count: count as 0 | 1 | 2,
                })
              }
            />

            <NumberStepper
              label={copy.design.powerArraySpares}
              value={design.spares.power_array}
              min={0}
              max={2}
              onChange={(count) =>
                dispatch({
                  type: 'SET_SPARE',
                  component: 'power_array',
                  count: count as 0 | 1 | 2,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'rules' })}
          disabled={!isWithinBudget}
          style={{
            backgroundColor: isWithinBudget
              ? 'var(--color-primary)'
              : 'var(--color-bg-surface-elevated)',
            color: isWithinBudget ? '#fff' : 'var(--color-text-faint)',
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {copy.design.nextButton}
        </button>
      </div>
    </div>
  );
};
