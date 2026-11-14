import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { AppStoreProvider, useAppStore } from '../../src/state/store.tsx';
import { CAMPAIGN_RUNS } from '../../src/state/useCampaign.ts';
import { RehearseScreen } from '../../src/ui/screens/Rehearse.tsx';

const Probe: React.FC = () => {
  const { state } = useAppStore();
  return <output data-testid="era">{state.sunEra}</output>;
};

describe('RehearseScreen (L7 AC1)', () => {
  it('lets the player pick the real Sun and run the campaign (main-thread fallback in jsdom)', async () => {
    render(
      <AppStoreProvider>
        <RehearseScreen />
        <Probe />
      </AppStoreProvider>,
    );
    expect(screen.getByText(copy.spaceWeather.title)).toBeDefined();
    expect(screen.getByText(/NASA DONKI/)).toBeDefined();
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(copy.spaceWeather.eras.stormy.name) }),
    );
    expect(screen.getByTestId('era').textContent).toBe('stormy');

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(copy.rehearse.runButton(CAMPAIGN_RUNS)) }),
    );
    await waitFor(
      () => expect(screen.getByText(new RegExp(copy.rehearse.completedNotice))).toBeDefined(),
      {
        timeout: 20000,
      },
    );
  }, 30000);
});
