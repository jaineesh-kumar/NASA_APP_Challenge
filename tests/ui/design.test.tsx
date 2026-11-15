import { fireEvent, render, screen, within } from '@testing-library/react';
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
    fireEvent.click(screen.getByRole('tab', { name: copy.stepTabs.designJunior.adjust }));
    expect(
      screen.getByRole('button', { name: `Increase ${copy.design.panelsLabel}` }),
    ).toBeDefined();
  });

  it('AC2: "+" is disabled once the next item would break the mass budget', () => {
    renderDesign();
    fireEvent.click(screen.getByRole('tab', { name: copy.stepTabs.designJunior.adjust }));
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

  it('L11 AC3: Junior shows three starter kits and four items; kits load their designs', () => {
    renderDesign();
    expect(missionPresets.map((p) => p.id)).toEqual(['light', 'balanced', 'heavy']);
    const heavy = missionPresets.find((p) => p.id === 'heavy');
    fireEvent.click(screen.getByRole('button', { name: new RegExp(heavy?.name ?? '') }));
    fireEvent.click(screen.getByRole('tab', { name: copy.stepTabs.designJunior.adjust }));
    const shields = screen.getByRole('status', { name: `${copy.design.shieldingLabel} count` });
    expect(shields.textContent).toBe(String(heavy?.design.shieldingLayers));
    // Four steppers outside More options: panels, batteries, shields, greenhouse.
    const adjust = screen.getByRole('region', { name: copy.kits.adjustTitle });
    expect(within(adjust).getAllByRole('button', { name: /^Increase / })).toHaveLength(4);
    expect(screen.getByRole('tab', { name: copy.stepTabs.designJunior.more })).toBeDefined();
  });

  it('Planner shows every control at once', () => {
    render(
      <AppStoreProvider initialState={{ ...initialAppState, mode: 'planner' }}>
        <DesignScreen />
      </AppStoreProvider>,
    );
    expect(screen.queryByRole('tab', { name: copy.stepTabs.designJunior.more })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: copy.stepTabs.designPlanner.power }));
    expect(screen.getByRole('button', { name: `Increase ${copy.design.mastLabel}` })).toBeDefined();
  });
});
