// Build screen: kits, hardware and spares within the mass budget (Spec B8, B10.7; L6, L11 AC3)
// Junior Mode: tabs for the three starter kits, four quick changes, and all other parts.
// Planner Mode: tabs for examples, landing spot, power, life support and spares.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { missionPresets } from '../../content/missions.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { ComponentId, SiteId } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';
import { MassBudgetBar } from '../components/MassBudgetBar.tsx';
import { NumberStepper } from '../components/NumberStepper.tsx';
import { SectionTabs } from '../components/SectionTabs.tsx';
import { SegmentedControl } from '../components/SegmentedControl.tsx';
import { StepHeader } from '../components/StepHeader.tsx';
import { Term } from '../components/Term.tsx';

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
  const { design, massUsed, mode } = state;
  const d = copy.design;
  const fits = (massId: string) => massUsed + m(massId) <= budget;
  const isJunior = mode === 'junior';

  const site = (
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
      onChange={(s) => dispatch({ type: 'SET_SITE', site: s })}
    />
  );
  const panels = (
    <NumberStepper
      label={d.panelsLabel}
      helpText={d.panelsHelp(k.panelKw, m('panel'))}
      value={design.panels}
      min={1}
      max={8}
      canIncrement={fits('panel')}
      onChange={(v) => dispatch({ type: 'SET_PANELS', panels: v })}
    />
  );
  const mast = (
    <NumberStepper
      label={d.mastLabel}
      helpText={d.mastHelp(m('mast_level'))}
      value={design.mastLevel}
      min={0}
      max={3}
      canIncrement={fits('mast_level')}
      onChange={(v) => dispatch({ type: 'SET_MAST', mastLevel: v as 0 | 1 | 2 | 3 })}
    />
  );
  const batteries = (
    <NumberStepper
      label={d.batteriesLabel}
      helpText={d.batteriesHelp(k.batteryKwhPerUnit, m('battery'))}
      value={design.batteries}
      min={1}
      max={12}
      canIncrement={fits('battery')}
      onChange={(v) => dispatch({ type: 'SET_BATTERIES', batteries: v })}
    />
  );
  const water = (
    <SegmentedControl
      label={d.waterLoopLabel}
      options={[
        { value: 0, label: copy.rehearse.basic, sublabel: d.waterLoopBase(pctOf(k.recoveryBase)) },
        {
          value: 1,
          label: copy.rehearse.upgraded,
          sublabel: d.waterLoopUpgraded(pctOf(k.recoveryUpgraded), m('water_tier1')),
        },
      ]}
      value={design.waterLoopTier}
      onChange={(tier) => dispatch({ type: 'SET_WATER_TIER', tier })}
    />
  );
  const o2 = (
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
  );
  const greenhouse = (
    <NumberStepper
      label={d.greenhouseLabel}
      helpText={d.greenhouseHelp(m('greenhouse_module'))}
      value={design.greenhouseModules}
      min={0}
      max={3}
      canIncrement={fits('greenhouse_module')}
      onChange={(v) => dispatch({ type: 'SET_GREENHOUSE', modules: v as 0 | 1 | 2 | 3 })}
    />
  );
  const shields = (
    <NumberStepper
      label={d.shieldingLabel}
      helpText={d.shieldingHelp(m('shield_layer'))}
      value={design.shieldingLayers}
      min={0}
      max={3}
      canIncrement={fits('shield_layer')}
      onChange={(v) => dispatch({ type: 'SET_SHIELDING', layers: v as 0 | 1 | 2 | 3 })}
    />
  );
  const spares = (
    <>
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
    </>
  );

  const tabs = isJunior
    ? [
        {
          id: 'kits',
          label: copy.stepTabs.designJunior.kits,
          content: (
            <section className="panel-card" aria-labelledby="kits-title">
              <h3 id="kits-title" className="card-title">
                {copy.kits.title}
              </h3>
              <p className="muted small" style={{ marginBottom: 12 }}>
                {copy.kits.intro}
              </p>
              <div className="kit-list">
                {missionPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="kit"
                    onClick={() => dispatch({ type: 'SET_PRESET', preset })}
                  >
                    <span className="kit-name">{preset.name}</span>
                    <span className="small">{preset.tagline}</span>
                    <span className="small muted">{preset.description}</span>
                  </button>
                ))}
              </div>
            </section>
          ),
        },
        {
          id: 'adjust',
          label: copy.stepTabs.designJunior.adjust,
          content: (
            <section className="panel-card" aria-labelledby="adjust-title">
              <h3 id="adjust-title" className="card-title">
                {copy.kits.adjustTitle}
              </h3>
              <div className="term-row">
                <Term term="Battery" />
                <Term term="Regolith" />
              </div>
              {panels}
              {batteries}
              {shields}
              {greenhouse}
            </section>
          ),
        },
        {
          id: 'more',
          label: copy.stepTabs.designJunior.more,
          content: (
            <section className="panel-card">
              <p className="muted small" style={{ marginBottom: 8 }}>
                {copy.kits.moreOptions}
              </p>
              <div className="term-row">
                <Term term="Recycling loop" />
                <Term term="Oxygen scrubber" />
              </div>
              <h3 className="card-title">{d.siteTitle}</h3>
              {site}
              {mast}
              {water}
              {o2}
              <h3 className="card-title" style={{ marginTop: 16 }}>
                {d.sparesSectionTitle}
              </h3>
              {spares}
            </section>
          ),
        },
      ]
    : [
        {
          id: 'presets',
          label: copy.stepTabs.designPlanner.presets,
          content: (
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
          ),
        },
        {
          id: 'site',
          label: copy.stepTabs.designPlanner.site,
          content: <section className="panel-card">{site}</section>,
        },
        {
          id: 'power',
          label: copy.stepTabs.designPlanner.power,
          content: (
            <section className="panel-card">
              {panels}
              {mast}
              {batteries}
            </section>
          ),
        },
        {
          id: 'life',
          label: copy.stepTabs.designPlanner.life,
          content: (
            <section className="panel-card">
              {water}
              {o2}
              {greenhouse}
              {shields}
            </section>
          ),
        },
        {
          id: 'spares',
          label: copy.stepTabs.designPlanner.spares,
          content: <section className="panel-card">{spares}</section>,
        },
      ];

  return (
    <div>
      <StepHeader step="design" title={d.heading} lead={d.subheading} />

      <MassBudgetBar />

      {/* Junior and Planner have different tabs, so each mode gets a fresh tab strip. */}
      <SectionTabs key={mode} label={copy.stepTabs.listLabel(copy.nav.design)} tabs={tabs} />
    </div>
  );
};
