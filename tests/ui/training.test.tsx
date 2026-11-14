// Training Bay: Power Juggle and Storm Shelter logic (engine numbers) and their pages.

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { getDonkiArchive, loadParams } from '../../src/engine/params.ts';
import { getProgress, resetProgress } from '../../src/state/progress.ts';
import {
  bestPossibleWork,
  juggleDemands,
  juggleSetup,
  JuggleState,
  newJuggle,
  runHour,
  toggleLoad,
} from '../../src/ui/training/powerJuggle.ts';
import {
  DAY_HOURS,
  isStormHour,
  newRound,
  newShelterState,
  playHour,
  referenceDoses,
  setSheltering,
  shelterSetup,
} from '../../src/ui/training/stormShelter.ts';

const params = loadParams();

describe('Power Juggle logic', () => {
  const setup = juggleSetup();
  const playToEnd = (s: JuggleState, plan?: (s: JuggleState) => JuggleState) => {
    let g = s;
    while (g.outcome === 'playing') g = runHour(setup, plan ? plan(g) : g);
    return g;
  };

  it('uses the engine numbers from params.json', () => {
    const d = juggleDemands(setup, newJuggle(setup));
    expect(d.life_support).toBe(params.getNumber('load.life_support_kw'));
    expect(d.thermal).toBe(
      params.getNumber('load.thermal_kw') * params.getNumber('power.thermal_dark_multiplier'),
    );
    expect(setup.darkHours).toBe(params.getNumber('site.ridge.dark_length_h'));
    expect(setup.capacityKwh % params.getNumber('power.battery_kwh_per_unit')).toBe(0);
  });

  it('with everything on, the battery runs out before sunrise (no free lunch)', () => {
    const end = playToEnd(newJuggle(setup));
    expect(end.outcome).toBe('trouble');
    expect(end.troubleLoad).not.toBeNull();
  });

  it('with the jobs off, the crew reaches sunrise; the battery never goes below zero', () => {
    let g = newJuggle(setup);
    for (const l of ['greenhouse', 'science', 'construction'] as const) g = toggleLoad(g, l);
    while (g.outcome === 'playing') {
      g = runHour(setup, g);
      expect(g.batteryKwh).toBeGreaterThanOrEqual(0);
    }
    expect(g.outcome).toBe('sunrise');
    expect(g.workHours).toBe(0);
  });

  it('a smart plan reaches sunrise with the best possible work', () => {
    const best = bestPossibleWork(setup);
    expect(best).toBeGreaterThan(0);
    // Science runs all night; the greenhouse runs too until the spare battery is used up.
    const greenhouseHours = best - setup.darkHours;
    const g = toggleLoad(newJuggle(setup), 'construction');
    const end = playToEnd(g, (s) =>
      s.hour >= greenhouseHours && s.isOn.greenhouse ? toggleLoad(s, 'greenhouse') : s,
    );
    expect(end.outcome).toBe('sunrise');
    expect(end.workHours).toBe(best);
  });
});

describe('Storm Shelter logic', () => {
  const setup = shelterSetup();

  it('replays real archived storms and warns exactly spe_warning_lead_h before onset', () => {
    const ids = getDonkiArchive().events.map((e) => e.id);
    for (let n = 0; n < ids.length; n++) {
      const r = newRound(setup, n);
      expect(ids).toContain(r.storm.id);
      expect(r.onsetH - r.warningH).toBe(params.getNumber('radiation.spe_warning_lead_h'));
      expect(r.warningH).toBeGreaterThan(0);
      expect(r.endH).toBeLessThanOrEqual(DAY_HOURS);
      expect(r.endH - r.onsetH).toBe(params.getNumber('radiation.spe_duration_h'));
    }
    expect(newRound(setup, 2)).toEqual(newRound(setup, 2));
  });

  it('hiding for the storm cuts the dose but costs work hours', () => {
    const r = newRound(setup, 0);
    let s = newShelterState();
    while (s.outcome === 'playing')
      s = playHour(setup, r, setSheltering(s, isStormHour(r, s.hour)));
    const ref = referenceDoses(setup, r);
    expect(s.doseUsv).toBeCloseTo(ref.smart, 6);
    expect(s.exposedStormHours).toBe(0);
    expect(s.workHours).toBe(ref.smartWork);
    expect(ref.smart).toBeLessThan(ref.never);
  });
});

describe('Training Bay pages', () => {
  beforeEach(() => {
    resetProgress();
  });

  it('lists Power Juggle and Storm Shelter', () => {
    window.location.hash = '#/training';
    render(<App />);
    const list = screen.getByRole('list', { name: copy.training.gamesLabel });
    expect(
      within(list).getByRole('link', { name: new RegExp(copy.training.juggle.name) }),
    ).toBeDefined();
    expect(
      within(list).getByRole('link', { name: new RegExp(copy.training.shelter.name) }),
    ).toBeDefined();
  });

  it('Power Juggle is played with switches and buttons, and saves a finished round', () => {
    window.location.hash = '#/training/power-juggle';
    render(<App />);
    const radio = screen.getByRole('switch', { name: new RegExp(copy.loads.comms) });
    expect(radio.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(radio);
    expect(radio.getAttribute('aria-checked')).toBe('false');
    for (let i = 0; i < 10; i++) {
      const run = screen.queryByRole('button', { name: new RegExp(copy.training.juggle.run6) });
      if (!run) break;
      fireEvent.click(run);
    }
    expect(
      screen.getByRole('button', { name: new RegExp(copy.training.juggle.again) }),
    ).toBeDefined();
    expect(getProgress().training.power_juggle?.plays).toBe(1);
  });

  it('Storm Shelter names the real storm and says it is archived, not live', () => {
    window.location.hash = '#/training/storm-shelter';
    render(<App />);
    expect(
      screen.getByText(copy.storms.archivedLabel(getDonkiArchive().retrievedAt)),
    ).toBeDefined();
    expect(screen.getByRole('radio', { name: copy.training.shelter.inside })).toBeDefined();
    expect(
      screen.getByRole('button', { name: new RegExp(copy.training.shelter.next3) }),
    ).toBeDefined();
  });
});
