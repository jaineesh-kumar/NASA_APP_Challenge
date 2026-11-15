// Mission Day page (ADR-016): each round brings a new seed and a new real storm, the orders
// change the outcome, and the page plays one day per click.

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { DayOrder } from '../../src/engine/types.ts';
import { daySetup, dayView, MISSION_DAYS, simulate } from '../../src/ui/missionDay/missionDay.ts';

const allDays = (o: DayOrder): DayOrder[] => Array.from({ length: MISSION_DAYS }, () => o);

describe('Mission Day logic', () => {
  it('every new round uses a new seed and a real archived storm', () => {
    const a = daySetup(0);
    const b = daySetup(1);
    expect(a.seed).not.toBe(b.seed);
    expect(a.stormMode.kind).toBe('replay');
    expect(b.stormMode).not.toEqual(a.stormMode);
    expect(a.rules.ifThen).toHaveLength(0);
  });

  it('no order is free: full speed every day can lose the crew; sheltering for the storm saves it', () => {
    // Round 2 replays a big archived storm (measured for ADR-016).
    const setup = daySetup(2);
    const careless = simulate(setup, allDays('full_speed'));
    expect(careless.survived).toBe(false);
    expect(careless.failureCause).toBe('dose');

    const stormDays = new Set(
      careless.log
        .filter((e) => e.type === 'spe_warning' || e.type === 'spe_start')
        .map((e) => Math.floor(e.t / 24)),
    );
    const careful = allDays('full_speed').map((o, d) => (stormDays.has(d) ? 'shelter' : o));
    const result = simulate(setup, careful);
    expect(result.survived).toBe(true);
    // Sheltering costs work: a shelter day adds no science.
    const day = [...stormDays][0]!;
    const sci = result.trace!.scienceHours;
    expect(sci[day * 24 + 23]).toBe(sci[day * 24 - 1]);
  });

  it('only shows a storm warning the radio actually heard', () => {
    const setup = daySetup(2);
    const on = simulate(setup, allDays('full_speed'));
    const warnDay = Math.floor(on.log.find((e) => e.type === 'spe_warning')!.t / 24);
    expect(dayView(on, warnDay + 1).isStormWarningHeard).toBe(true);
    const off = simulate(setup, allDays('radio_off'));
    expect(dayView(off, warnDay + 1).isStormWarningHeard).toBe(false);
  });
});

describe('Mission Day page', () => {
  it('plays one day per click with the picked order', () => {
    window.location.hash = '#/mission-day';
    render(<App />);
    expect(screen.getByRole('heading', { name: copy.missionDay.title })).toBeDefined();
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(copy.missionDay.orders.shelter.name) }),
    );
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.missionDay.run(1)) }));
    expect(
      screen.getByRole('heading', { name: copy.missionDay.dayOf(1, MISSION_DAYS) }),
    ).toBeDefined();
    expect(screen.getByRole('heading', { name: copy.missionDay.newsTitle(1) })).toBeDefined();
    expect(screen.getByRole('button', { name: new RegExp(copy.missionDay.run(2)) })).toBeDefined();
  });
});
