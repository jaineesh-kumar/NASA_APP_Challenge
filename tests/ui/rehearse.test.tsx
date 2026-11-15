import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { getDonkiArchive } from '../../src/engine/params.ts';
import { AppStoreProvider, useAppStore } from '../../src/state/store.tsx';
import { CAMPAIGN_RUNS } from '../../src/state/useCampaign.ts';
import { stormDate } from '../../src/ui/components/StormPicker.tsx';
import { RehearseScreen } from '../../src/ui/screens/Rehearse.tsx';

const archive = getDonkiArchive();

const Probe: React.FC = () => {
  const { state } = useAppStore();
  return <output data-testid="mode">{JSON.stringify(state.stormMode)}</output>;
};

describe('RehearseScreen (L7 AC1, L10 AC6, AC7)', () => {
  it('AC6: the storm picker lists archived storms with the archived label and source badge', () => {
    render(
      <AppStoreProvider>
        <RehearseScreen />
      </AppStoreProvider>,
    );
    expect(screen.getByText(copy.storms.title)).toBeDefined();
    expect(
      screen.getAllByText(
        new RegExp(copy.storms.archivedLabel(archive.retrievedAt).replace(/\./g, '\\.')),
      ).length,
    ).toBeGreaterThan(0);
    for (const e of archive.events) {
      expect(
        screen.getByRole('radio', { name: new RegExp(copy.storms.replayName(stormDate(e))) }),
      ).toBeDefined();
    }
    expect(screen.getAllByText(copy.storms.sourceBadge)).toHaveLength(archive.events.length);
    fireEvent.click(screen.getByRole('tab', { name: copy.stepTabs.rehearse.data }));
    expect(screen.getByRole('region', { name: new RegExp(copy.dataPanel.title) })).toBeDefined();
  });

  it('AC7: replaying a real storm runs the campaign and reports "Your crew vs the storm of <date>"', async () => {
    const storm = archive.events[0];
    if (!storm) throw new Error('archive is empty');
    render(
      <AppStoreProvider>
        <RehearseScreen />
        <Probe />
      </AppStoreProvider>,
    );
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(copy.storms.replayName(stormDate(storm))) }),
    );
    expect(screen.getByTestId('mode').textContent).toBe(
      JSON.stringify({ kind: 'replay', eventId: storm.id }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(copy.rehearse.runButton(CAMPAIGN_RUNS)) }),
    );
    await waitFor(
      () => expect(screen.getByText(new RegExp(copy.rehearse.completedNotice))).toBeDefined(),
      {
        timeout: 20000,
      },
    );
    expect(
      screen.getByText(
        new RegExp(
          `Your crew vs the storm of ${stormDate(storm)}: \\d+ out of every 100 came home`,
        ),
      ),
    ).toBeDefined();
  }, 30000);
});
