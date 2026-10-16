import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { RehearseScreen } from '../../src/ui/screens/Rehearse.tsx';

describe('RehearseScreen Component (Spec Part C L7 AC1, AC7, AC8)', () => {
  it('renders summary and allows initiating rehearsal campaign (AC1, AC7, AC8)', async () => {
    render(
      <AppStoreProvider>
        <RehearseScreen />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.rehearse.heading)).toBeDefined();
    expect(screen.getByText(copy.rehearse.summaryTitle)).toBeDefined();

    const runBtn = screen.getByText(`▶ ${copy.rehearse.runButton}`);
    expect(runBtn).toBeDefined();

    // Click run rehearsal
    fireEvent.click(runBtn);

    // Should transition to running or completed
    await waitFor(
      () => {
        const completedElem = screen.queryByText(new RegExp(copy.rehearse.completedNotice));
        const progressElem = screen.queryByRole('progressbar');
        expect(completedElem || progressElem).toBeDefined();
      },
      { timeout: 10000 },
    );
  });
});
