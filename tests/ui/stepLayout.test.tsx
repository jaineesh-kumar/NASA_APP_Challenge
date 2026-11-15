import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { CAMPAIGN_RUNS } from '../../src/state/useCampaign.ts';
import { SectionTabs } from '../../src/ui/components/SectionTabs.tsx';

describe('step layout: buttons under the intro, parts in tabs', () => {
  beforeEach(() => {
    window.location.hash = '#/free-build';
  });

  it('every step shows Next right after its intro paragraph, before the tabs', () => {
    render(<App />);
    for (const step of ['briefing', 'design', 'rules', 'rehearse'] as const) {
      const next = screen.getByRole('button', { name: new RegExp(copy.flow.next[step]) });
      const header = next.closest('header.step-header');
      expect(header).not.toBeNull();
      const tabs = screen.getByRole('tablist', { name: copy.stepTabs.listLabel(copy.nav[step]) });
      // The header (and its Next button) comes before the tab strip in the page.
      expect(header!.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      if (step === 'rehearse') break; // Review needs a test result first.
      fireEvent.click(next);
    }
  });

  it('the Run test button sits in the Test step header', () => {
    render(<App />);
    for (const step of ['briefing', 'design', 'rules'] as const) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.flow.next[step]) }));
    }
    const header = screen
      .getByRole('heading', { name: copy.rehearse.heading })
      .closest('header') as HTMLElement;
    expect(
      within(header).getByRole('button', {
        name: new RegExp(copy.rehearse.runButton(CAMPAIGN_RUNS)),
      }),
    ).toBeDefined();
  });

  it('tabs show one panel at a time and move with the arrow keys', () => {
    render(
      <SectionTabs
        label="Parts"
        tabs={[
          { id: 'a', label: 'Alpha', content: <p>first panel</p> },
          { id: 'b', label: 'Bravo', content: <p>second panel</p> },
          { id: 'c', label: 'Charlie', content: <p>third panel</p> },
        ]}
      />,
    );
    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('first panel');

    fireEvent.click(screen.getByRole('tab', { name: 'Bravo' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('second panel');

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Bravo' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Charlie' }).getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Charlie' }));

    // Wraps around, and Home / End jump to the ends.
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Charlie' }), { key: 'ArrowRight' });
    expect(alpha.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(alpha, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Charlie' }).getAttribute('aria-selected')).toBe('true');
    // Only the active tab is in the Tab order.
    expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });
});
