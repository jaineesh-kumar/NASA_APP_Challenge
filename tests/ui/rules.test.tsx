import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { RulesScreen } from '../../src/ui/screens/Rules.tsx';

describe('RulesScreen Component (Spec Part C L6 AC4, AC5, AC7, AC9)', () => {
  it('renders priority ladder and allows accessible reordering (AC4, AC9)', () => {
    render(
      <AppStoreProvider>
        <RulesScreen />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.rules.heading)).toBeDefined();
    expect(screen.getByText(copy.rules.priorityTitle)).toBeDefined();

    // The second load has a "Move up" button
    const thermalMoveUpBtn = screen.getByLabelText(
      `Move up ${copy.loads.thermal}`,
    ) as HTMLButtonElement;
    expect(thermalMoveUpBtn.disabled).toBe(false);

    // Top load "Move up" button is disabled
    const lifeSupportMoveUpBtn = screen.getByLabelText(
      `Move up ${copy.loads.life_support}`,
    ) as HTMLButtonElement;
    expect(lifeSupportMoveUpBtn.disabled).toBe(true);

    // Click Move Up on Thermal
    fireEvent.click(thermalMoveUpBtn);

    // Thermal is now at the top
    const updatedThermalBtn = screen.getByLabelText(
      `Move up ${copy.loads.thermal}`,
    ) as HTMLButtonElement;
    expect(updatedThermalBtn.disabled).toBe(true);
  });

  it('adds and removes rules via rule creator (AC5)', () => {
    render(
      <AppStoreProvider>
        <RulesScreen />
      </AppStoreProvider>,
    );

    const addRuleBtn = screen.getByText(copy.rules.addRuleButton);
    expect(addRuleBtn).toBeDefined();

    // Add a rule
    fireEvent.click(addRuleBtn);

    // Remove buttons should be present
    const removeButtons = screen.getAllByText(new RegExp(copy.rules.removeRule));
    expect(removeButtons.length).toBeGreaterThan(0);

    const countBefore = removeButtons.length;
    fireEvent.click(removeButtons[0]!);

    const countAfter = screen.queryAllByText(new RegExp(copy.rules.removeRule)).length;
    expect(countAfter).toBe(countBefore - 1);
  });
});
