import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { missionPresets } from '../../src/content/missions.ts';
import { loadParams } from '../../src/engine/params.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { DesignScreen } from '../../src/ui/screens/Design.tsx';

const budget = loadParams().getNumber('mass.budget');

const renderDesign = () =>
  render(
    <AppStoreProvider>
      <DesignScreen />
    </AppStoreProvider>,
  );

describe('DesignScreen (L6 AC1, AC2, AC5, AC6)', () => {
  it('renders the mass meter and steppers with accessible names', () => {
    renderDesign();
    expect(screen.getByText(copy.design.heading)).toBeDefined();
    expect(screen.getByRole('progressbar')).toBeDefined();
    expect(
      screen.getByRole('button', { name: `Increase ${copy.design.panelsLabel}` }),
    ).toBeDefined();
  });

  it('AC2: "+" is disabled once the next item would break the mass budget', () => {
    renderDesign();
    const plus = screen.getByRole('button', {
      name: `Increase ${copy.design.batteriesLabel}`,
    }) as HTMLButtonElement;
    for (let i = 0; i < 20 && !plus.disabled; i++) fireEvent.click(plus);
    expect(plus.disabled).toBe(true);
    const bar = screen.getByRole('progressbar');
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(budget);
  });

  it('shows the over-budget warning for a loaded design that is too heavy', () => {
    const heavy = {
      ...initialAppState.design,
      batteries: 12,
      panels: 8,
      shieldingLayers: 3 as const,
    };
    render(
      <AppStoreProvider
        initialState={{
          ...initialAppState,
          design: heavy,
          massUsed: budget + 1,
          isWithinBudget: false,
        }}
      >
        <DesignScreen />
      </AppStoreProvider>,
    );
    expect(screen.getByText(copy.design.overBudgetWarning)).toBeDefined();
  });

  it('example bases load their designs', () => {
    renderDesign();
    const crater = missionPresets.find((p) => p.id === 'crater_camp');
    expect(crater).toBeDefined();
    fireEvent.click(screen.getByText(crater?.name ?? ''));
    const craterRadio = screen.getByRole('radio', { name: new RegExp(copy.design.craterName) });
    expect(craterRadio.getAttribute('aria-checked')).toBe('true');
  });
});
