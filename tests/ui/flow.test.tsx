import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { loadParams } from '../../src/engine/params.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { StepFooter } from '../../src/ui/components/StepFooter.tsx';

const budget = loadParams().getNumber('mass.budget');

describe('step-by-step flow (pagination)', () => {
  // The five-step flow lives on the Free build page (#/free-build).
  beforeEach(() => {
    window.location.hash = '#/free-build';
  });

  it('starts on Briefing as step 1 of 5 and pages with Next and Back', () => {
    render(<App />);
    expect(screen.getByText(copy.flow.stepOf(1, 5))).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.flow.next.briefing) }));
    expect(screen.getByText(copy.flow.stepOf(2, 5))).toBeDefined();
    expect(screen.getByText(copy.design.heading)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${copy.flow.back}$`) }));
    expect(screen.getByText(copy.flow.stepOf(1, 5))).toBeDefined();
  });

  it('marks the current stub and stamps finished steps Done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.flow.next.briefing) }));
    const nav = screen.getByRole('navigation', { name: copy.nav.label });
    const build = within(nav).getByRole('button', { name: copy.nav.design });
    expect(build.getAttribute('aria-current')).toBe('step');
    expect(
      within(nav).getByRole('button', { name: new RegExp(copy.nav.briefing) }).textContent,
    ).toContain(copy.flow.done);
  });

  it('locks Next with a kid-friendly reason when the rocket is too heavy', () => {
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
          currentScreen: 'design',
          design: heavy,
          massUsed: budget + 1,
          isWithinBudget: false,
        }}
      >
        <StepFooter step="design" />
      </AppStoreProvider>,
    );
    const next = screen.getByRole('button', {
      name: new RegExp(copy.flow.next.design),
    }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    expect(screen.getByText(copy.flow.locked.overBudget)).toBeDefined();
  });

  it('locks See the results until a test has run', () => {
    render(
      <AppStoreProvider initialState={{ ...initialAppState, currentScreen: 'rehearse' }}>
        <StepFooter step="rehearse" />
      </AppStoreProvider>,
    );
    expect(
      (
        screen.getByRole('button', {
          name: new RegExp(copy.flow.next.rehearse),
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText(copy.flow.locked.noResult)).toBeDefined();
  });

  it('other pages sit outside the flow, and the flow keeps its step when you come back', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.flow.next.briefing) }));
    expect(screen.getByText(copy.flow.stepOf(2, 5))).toBeDefined();
    const menu = screen.getByRole('navigation', { name: copy.site.navLabel });
    fireEvent.click(within(menu).getByRole('link', { name: copy.site.pages.words }));
    expect(await screen.findByRole('heading', { name: copy.words.title })).toBeDefined();
    expect(screen.queryByText(copy.flow.stepOf(2, 5))).toBeNull();
    fireEvent.click(within(menu).getByRole('link', { name: copy.site.pages['free-build'] }));
    expect(await screen.findByText(copy.flow.stepOf(2, 5))).toBeDefined();
  });
});
