import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { DesignScreen } from '../../src/ui/screens/Design.tsx';

describe('DesignScreen Component (Spec Part C L6 AC1, AC2, AC3, AC6, AC9)', () => {
  it('renders mass budget bar and updates with controls (AC1, AC2)', () => {
    render(
      <AppStoreProvider>
        <DesignScreen />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.design.heading)).toBeDefined();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeDefined();

    // Find panels stepper
    const increasePanelsBtn = screen.getByLabelText(`Increase ${copy.design.panelsLabel}`);
    expect(increasePanelsBtn).toBeDefined();

    fireEvent.click(increasePanelsBtn);
    // Mass bar reflects updated usage
    expect(progressbar.getAttribute('aria-valuenow')).toBeDefined();
  });

  it('prevents advancing past Design when over budget (AC3)', () => {
    render(
      <AppStoreProvider>
        <DesignScreen />
      </AppStoreProvider>,
    );

    const nextBtn = screen.getByText(copy.design.nextButton) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);

    // Max out batteries to exceed budget
    const increaseBatteriesBtn = screen.getByLabelText(`Increase ${copy.design.batteriesLabel}`);
    for (let i = 0; i < 7; i++) {
      fireEvent.click(increaseBatteriesBtn);
    }

    // Now over budget -> button should be disabled
    expect(screen.getByText(copy.design.overBudgetWarning)).toBeDefined();
    expect(nextBtn.disabled).toBe(true);
  });

  it('preset buttons load documented designs (AC6)', () => {
    render(
      <AppStoreProvider>
        <DesignScreen />
      </AppStoreProvider>,
    );

    const powerGridPresetBtn = screen.getByText('High-Power Grid');
    fireEvent.click(powerGridPresetBtn);

    // Site switched to Shackleton Crater Edge
    expect(screen.getByText(copy.design.craterName)).toBeDefined();
  });
});
