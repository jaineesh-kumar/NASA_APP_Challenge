// Build screen: site, hardware, spares within the mass budget (Spec B8; L6 AC1, AC2, AC6)

import React from 'react';
import { copy } from '../../content/copy.ts';
import { missionPresets } from '../../content/missions.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { ComponentId, SiteId } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';
import { MassBudgetBar } from '../components/MassBudgetBar.tsx';
import { NumberStepper } from '../components/NumberStepper.tsx';
import { SegmentedControl } from '../components/SegmentedControl.tsx';

const params = loadParams();
const k = getSimConstants(params);
const m = (id: string) => params.getNumber(`mass.${id}`);
const budget = m('budget');
const pctOf = (v: number) => Math.round(v * 100);

function darkPct(site: SiteId): number {
  return Math.round(((k.darkStartsH[site].length * k.darkLengthH[site]) / k.missionHours) * 100);
}

const SPARES: Array<[ComponentId, string]> = [
  ['co2_scrubber', copy.design.co2ScrubberSpares],
  ['o2_generator', copy.design.o2GenSpares],
  ['water_processor', copy.design.waterProcSpares],
  ['power_array', copy.design.powerArraySpares],
];

export const DesignScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const { design, massUsed } = state;
  const d = copy.design;
  const fits = (massId: string) => massUsed + m(massId) <= budget;

  return (
    <div>
      <h2 className="screen-title">{d.heading}</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        {d.subheading}
      </p>

      <MassBudgetBar />

      <section className="panel-card" aria-labelledby="presets-title">
        <h3 id="presets-title" className="card-title">
          {d.presetsTitle}
        </h3>
        <div className="row">
          {missionPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_PRESET', preset })}
              style={{ textAlign: 'left' }}
            >
              <div style={{ fontWeight: 600 }}>{preset.name}</div>
              <div className="muted small">{preset.tagline}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid-2col">
        <div>
          <section className="panel-card">
            <h3 className="card-title">{d.siteTitle}</h3>
            <SegmentedControl
              label={d.siteLabel}
              options={[
                {
                  value: 'ridge',
                  label: d.ridgeName,
                  sublabel: d.ridgeDesc(darkPct('ridge'), k.startWaterKg.ridge),
                },
                {
                  value: 'crater_edge',
                  label: d.craterName,
                  sublabel: d.craterDesc(darkPct('crater_edge'), k.startWaterKg.crater_edge),
                },
              ]}
              value={design.site}
              onChange={(site) => dispatch({ type: 'SET_SITE', site })}
            />
          </section>

          <section className="panel-card">
            <h3 className="card-title">{d.powerSectionTitle}</h3>
            <NumberStepper
              label={d.panelsLabel}
              helpText={d.panelsHelp(k.panelKw, m('panel'))}
              value={design.panels}
              min={1}
              max={8}
              canIncrement={fits('panel')}
              onChange={(panels) => dispatch({ type: 'SET_PANELS', panels })}
            />
            <NumberStepper
              label={d.mastLabel}
              helpText={d.mastHelp(m('mast_level'))}
              value={design.mastLevel}
              min={0}
              max={3}
              canIncrement={fits('mast_level')}
              onChange={(v) => dispatch({ type: 'SET_MAST', mastLevel: v as 0 | 1 | 2 | 3 })}
            />
            <NumberStepper
              label={d.batteriesLabel}
              helpText={d.batteriesHelp(k.batteryKwhPerUnit, m('battery'))}
              value={design.batteries}
              min={1}
              max={12}
              canIncrement={fits('battery')}
              onChange={(batteries) => dispatch({ type: 'SET_BATTERIES', batteries })}
            />
          </section>
        </div>

        <div>
          <section className="panel-card">
            <h3 className="card-title">{d.lifeSupportSectionTitle}</h3>
            <SegmentedControl
              label={d.waterLoopLabel}
              options={[
                {
                  value: 0,
                  label: copy.rehearse.basic,
                  sublabel: d.waterLoopBase(pctOf(k.recoveryBase)),
                },
                {
                  value: 1,
                  label: copy.rehearse.upgraded,
                  sublabel: d.waterLoopUpgraded(pctOf(k.recoveryUpgraded), m('water_tier1')),
                },
              ]}
              value={design.waterLoopTier}
              onChange={(tier) => dispatch({ type: 'SET_WATER_TIER', tier })}
            />
            <SegmentedControl
              label={d.o2LoopLabel}
              options={[
                { value: 0, label: copy.rehearse.basic, sublabel: d.o2LoopBase },
                {
                  value: 1,
                  label: 'Sabatier',
                  sublabel: d.o2LoopSabatier(pctOf(k.sabatierRecovery), m('o2_tier1')),
                },
              ]}
              value={design.o2LoopTier}
              onChange={(tier) => dispatch({ type: 'SET_O2_TIER', tier })}
            />
            <NumberStepper
              label={d.greenhouseLabel}
              helpText={d.greenhouseHelp(m('greenhouse_module'))}
              value={design.greenhouseModules}
              min={0}
              max={3}
              canIncrement={fits('greenhouse_module')}
              onChange={(v) => dispatch({ type: 'SET_GREENHOUSE', modules: v as 0 | 1 | 2 | 3 })}
            />
            <NumberStepper
              label={d.shieldingLabel}
              helpText={d.shieldingHelp(m('shield_layer'))}
              value={design.shieldingLayers}
              min={0}
              max={3}
              canIncrement={fits('shield_layer')}
              onChange={(v) => dispatch({ type: 'SET_SHIELDING', layers: v as 0 | 1 | 2 | 3 })}
            />
          </section>

          <section className="panel-card">
            <h3 className="card-title">{d.sparesSectionTitle}</h3>
            <p className="muted small" style={{ marginBottom: 8 }}>
              {d.sparesHelp(m('spare'))}
            </p>
            {SPARES.map(([id, label]) => (
              <NumberStepper
                key={id}
                label={label}
                value={design.spares[id]}
                min={0}
                max={2}
                canIncrement={fits('spare')}
                onChange={(count) =>
                  dispatch({ type: 'SET_SPARE', component: id, count: count as 0 | 1 | 2 })
                }
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};
