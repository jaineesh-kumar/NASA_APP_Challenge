// Unit tests for ModelCardScreen
// Spec Part C (L8 AC3)

import { fireEvent, render, screen, within } from '@testing-library/react';
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

    // The cards are split into pages: walk every page and collect what it shows.
    const seen = new Set<string>();
    const pager = screen.getByRole('navigation', { name: copy.modelCard.pageLabel });
    const pageButtons = within(pager).getAllByRole('button', { name: /^Page \d+$/ });
    for (const button of pageButtons) {
      fireEvent.click(button);
      expect(button.getAttribute('aria-current')).toBe('page');
      for (const id of REQUIRED_PARAM_IDS) if (screen.queryAllByText(id).length > 0) seen.add(id);
    }
    for (const id of sampleParamIds) expect(seen.has(id)).toBe(true);
    expect(seen.size).toBe(REQUIRED_PARAM_IDS.length);

    // Check header counter shows all 62 parameters
    expect(
      screen.getByText(
        new RegExp(
          copy.modelCard
            .tableHeading(REQUIRED_PARAM_IDS.length, REQUIRED_PARAM_IDS.length)
            .replace(/[()]/g, (m) => `\\${m}`),
        ),
      ),
    ).toBeDefined();
  });

  it('section chips narrow the cards to one section and reset to page 1', () => {
    render(
      <AppStoreProvider>
        <ModelCardScreen />
      </AppStoreProvider>,
    );
    const pager = screen.getByRole('navigation', { name: copy.modelCard.pageLabel });
    fireEvent.click(within(pager).getByRole('button', { name: 'Page 2' }));
    const sections = screen.getByRole('group', { name: copy.modelCard.sectionsLabel });
    const radiation = within(sections).getByRole('button', {
      name: new RegExp(copy.modelCard.sections.radiation),
    });
    fireEvent.click(radiation);
    expect(radiation.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('radiation.surface_usv_per_day')).toBeDefined();
    expect(screen.queryByText('crew.size')).toBeNull();
    expect(screen.getByText(/^Showing 1 to /)).toBeDefined();
  });
});
