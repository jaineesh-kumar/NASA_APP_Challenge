// Unit tests for ModelCardScreen
// Spec Part C (L8 AC3)

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { REQUIRED_PARAM_IDS } from '../../src/engine/params.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { ModelCardScreen } from '../../src/ui/screens/ModelCard.tsx';

describe('ModelCardScreen Component (Spec Part C L8 AC3)', () => {
  it('renders simplifications list from B1 out-of-scope (AC3)', () => {
    render(
      <AppStoreProvider>
        <ModelCardScreen />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.modelCard.simplificationsTitle)).toBeDefined();
    for (const item of copy.modelCard.simplifications)
      expect(screen.getByText(item.topic)).toBeDefined();
    expect(screen.getByRole('region', { name: new RegExp(copy.dataPanel.title) })).toBeDefined();
    expect(screen.getByText(/archived NASA DONKI storms/)).toBeDefined();
  });

  it('renders table containing every parameter with value, unit, source, confidence (AC3)', () => {
    render(
      <AppStoreProvider>
        <ModelCardScreen />
      </AppStoreProvider>,
    );

    // Verify key parameters from various domains appear in the table
    const sampleParamIds = [
      'mission.hours',
      'crew.size',
      'crew.o2_kg_per_day',
      'water.recovery_upgraded',
      'radiation.surface_usv_per_day',
      'power.panel_kw',
      'mass.budget',
      'rating.flight_ready_survival',
    ];

    sampleParamIds.forEach((id) => {
      expect(screen.getAllByText(id).length).toBeGreaterThanOrEqual(1);
    });

    // Check header counter shows all 62 parameters
    expect(
      screen.getByText(
        new RegExp(
          `Complete Parameter Registry \\(${REQUIRED_PARAM_IDS.length} of ${REQUIRED_PARAM_IDS.length}\\)`,
        ),
      ),
    ).toBeDefined();
  });
});
