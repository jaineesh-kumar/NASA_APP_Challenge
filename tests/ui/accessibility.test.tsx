// Accessibility, Contrast, and Resilience Tests
// Spec Part C (L9 AC1, AC2, AC3)

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { EXTRA_ROUTE_IDS, ROUTE_IDS } from '../../src/ui/router.ts';
import { copy } from '../../src/content/copy.ts';
import { ErrorBoundary } from '../../src/ui/components/ErrorBoundary.tsx';

describe('Level 9 Verification: Accessibility, Contrast & Error States (Spec L9 AC1-AC3)', () => {
  it('allows keyboard-only navigation across all interactive screens (AC1)', () => {
    window.location.hash = '#/free-build';
    render(<App />);

    // Navigation bar should have accessible roles
    const nav = screen.getByRole('navigation', { name: copy.nav.label });
    expect(nav).toBeDefined();

    // Verify all 5 mission step buttons exist and are keyboard focusable
    const screenButtons = [
      copy.nav.briefing,
      copy.nav.design,
      copy.nav.rules,
      copy.nav.rehearse,
      copy.nav.review,
    ];

    screenButtons.forEach((btnName) => {
      const btn = screen.getByRole('button', { name: btnName });
      expect(btn).toBeDefined();
      expect(btn.tabIndex).toBeGreaterThanOrEqual(0);
    });

    // Every page of the site is a real link (keyboard reachable): menu pages in the main menu,
    // the quiz as the header's Quiz button.
    const menu = screen.getByRole('navigation', { name: copy.site.navLabel });
    // Open every dropdown one at a time and collect its links.
    const found = new Map<string, string | null>();
    const read = () => {
      for (const a of within(menu).getAllByRole('link'))
        found.set(a.textContent ?? '', a.getAttribute('href'));
    };
    read();
    for (const b of within(menu).getAllByRole('button')) {
      fireEvent.click(b);
      read();
    }
    ROUTE_IDS.forEach((id) => {
      expect(found.get(copy.site.pages[id])).toMatch(/^#\//);
    });
    // Each group button is a real button with its expanded state.
    for (const b of within(menu).getAllByRole('button')) {
      expect(b.getAttribute('aria-expanded')).toMatch(/true|false/);
    }
    EXTRA_ROUTE_IDS.forEach((id) => {
      const link = screen.getByRole('link', { name: new RegExp(copy.site.pages[id]) });
      expect(link.getAttribute('href')).toBe(`#/${id}`);
    });
  });

  it('validates color tokens guarantee WCAG AA 4.5:1 text contrast ratios (AC2)', () => {
    // Relative luminance calculation helper (WCAG 2.1)
    function getLuminance(r: number, g: number, b: number): number {
      const a = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
    }

    function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
      const l1 = getLuminance(...rgb1);
      const l2 = getLuminance(...rgb2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // Text/background pairs from src/ui/styles/tokens.css (bright ticket-wallet theme)
    const hex = (h: string): [number, number, number] => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ];
    const pairs: Array<[string, string, string]> = [
      ['navy on sky ground', '#14245c', '#dcebff'],
      ['navy on coupon white', '#14245c', '#ffffff'],
      ['muted on coupon white', '#45557f', '#ffffff'],
      ['muted on sky ground', '#45557f', '#dcebff'],
      ['muted on elevated', '#45557f', '#f2f6ff'],
      ['white on rocket red button', '#ffffff', '#cc2a1f'],
      ['sun numbers on navy strip', '#ffc233', '#14245c'],
      ['navy on sun stamp', '#14245c', '#ffc233'],
      ['carbon numbers on white', '#5b3fd9', '#ffffff'],
      ['navy on carbon wash', '#14245c', '#eee9ff'],
      ['warning text on white', '#8a5a00', '#ffffff'],
      ['warning text on warning bg', '#5c3c00', '#fff1cc'],
      ['danger text on danger bg', '#7d1710', '#ffe3e0'],
      ['success text on white', '#127a3e', '#ffffff'],
      // Site pages (src/ui/styles/pages.css)
      ['success text on success bg (goal, right answer)', '#127a3e', '#ddf5e6'],
      ['carbon on carbon wash (earned badge, mission banner)', '#5b3fd9', '#eee9ff'],
      ['rocket-deep tag on carbon wash (needed all night)', '#a9211a', '#eee9ff'],
      ['danger text on elevated (urgent radio line)', '#b4231a', '#f2f6ff'],
      ['muted on highlight (site menu hover)', '#45557f', '#e4ecff'],
      ['white on navy (current menu page)', '#ffffff', '#14245c'],
      // Editorial type (2026-11-15)
      ['body gray on sky ground', '#333333', '#dcebff'],
      ['body gray on white card', '#333333', '#ffffff'],
      ['body gray on carbon wash', '#333333', '#eee9ff'],
      ['meta gray on sky ground', '#555555', '#dcebff'],
      ['meta gray on white card', '#555555', '#ffffff'],
      ['red title accent (rocket-deep) on sky ground', '#a9211a', '#dcebff'],
    ];
    for (const [name, fg, bg] of pairs) {
      const ratio = getContrast(hex(fg), hex(bg));
      expect(ratio, `${name}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('ErrorBoundary recovers cleanly when a component throws an unhandled error (AC3)', () => {
    const ProblematicChild: React.FC = () => {
      throw new Error('Simulation fault: hardware bus disconnected');
    };

    render(
      <ErrorBoundary>
        <ProblematicChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Simulation Recovery System')).toBeDefined();
    expect(screen.getByText(/hardware bus disconnected/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Reset Outpost to Nominal Baseline/ })).toBeDefined();
  });

  it('displays user-facing error alert when importing a corrupt scenario code (AC3)', () => {
    // Scenario codes live on the For teachers page
    window.location.hash = '#/teachers';
    render(<App />);

    // Click on Share tab
    const shareTab = screen.getByRole('tab', { name: /Share Scenario Codes/i });
    fireEvent.click(shareTab);

    // Input corrupt scenario code
    const textarea = screen.getByLabelText(/Mission scenario code input/i);
    const loadBtn = screen.getByRole('button', { name: /Load Scenario Code/i });

    // Simulate invalid input
    fireEvent.change(textarea, { target: { value: 'CORRUPT-CODE-123' } });
    fireEvent.click(loadBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toMatch(/Import Error/i);
  });
});
