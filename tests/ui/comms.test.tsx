import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { loadParams } from '../../src/engine/params.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { RulesScreen } from '../../src/ui/screens/Rules.tsx';

const params = loadParams();

describe('comms link explained in kid words (L12 AC6)', () => {
  it('the Rules step explains the radio trade-off and Moon vs Mars delay, with numbers from params', () => {
    render(
      <AppStoreProvider>
        <RulesScreen />
      </AppStoreProvider>,
    );
    const note = copy.rules.delayNote(
      params.getNumber('comms.moon_one_way_delay_s'),
      params.getNumberArray('comms.earth_mars_light_delay_min'),
    );
    expect(screen.getByText(copy.rules.commsNote, { exact: false })).toBeDefined();
    expect(screen.getByText(note, { exact: false })).toBeDefined();
    expect(note).toContain('1.3 seconds');
    expect(
      screen.getByRole('button', { name: /Why this number for comms.moon_one_way_delay_s/ }),
    ).toBeDefined();
  });
});
