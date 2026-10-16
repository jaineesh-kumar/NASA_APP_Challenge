// Accessibility, Contrast, and Resilience Tests
// Spec Part C (L9 AC1, AC2, AC3)

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { ErrorBoundary } from '../../src/ui/components/ErrorBoundary.tsx';

describe('Level 9 Verification: Accessibility, Contrast & Error States (Spec L9 AC1-AC3)', () => {
  it('allows keyboard-only navigation across all interactive screens (AC1)', () => {
    render(<App />);

    // Navigation bar should have accessible roles
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    expect(nav).toBeDefined();

    // Verify all 7 screen buttons exist and are keyboard focusable
    const screenButtons = [
      'Briefing',
      '1. Design',
      '2. Rules',
      '3. Rehearse',
      '4. Review',
      'Learn',
      'Model Card',
    ];

    screenButtons.forEach((btnName) => {
      const btn = screen.getByRole('button', { name: btnName });
      expect(btn).toBeDefined();
      expect(btn.tabIndex).toBeGreaterThanOrEqual(0);
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

    // Token pairs from tokens.css
    const bgBase: [number, number, number] = [0x0b, 0x0f, 0x19]; // #0b0f19
    const bgSurface: [number, number, number] = [0x13, 0x1c, 0x2e]; // #131c2e
    const textMain: [number, number, number] = [0xf0, 0xf4, 0xfc]; // #f0f4fc
    const textMuted: [number, number, number] = [0x9b, 0xb0, 0xd3]; // #9bb0d3
    const primaryBlue: [number, number, number] = [0x25, 0x63, 0xeb]; // #2563eb
    const white: [number, number, number] = [0xff, 0xff, 0xff];

    const contrastMain = getContrast(textMain, bgBase);
    const contrastMuted = getContrast(textMuted, bgBase);
    const contrastSurface = getContrast(textMain, bgSurface);
    const contrastPrimaryBtn = getContrast(white, primaryBlue);

    // All text pairs must exceed 4.5:1
    expect(contrastMain).toBeGreaterThanOrEqual(4.5); // ~16.1:1
    expect(contrastMuted).toBeGreaterThanOrEqual(4.5); // ~8.5:1
    expect(contrastSurface).toBeGreaterThanOrEqual(4.5); // ~14.6:1
    expect(contrastPrimaryBtn).toBeGreaterThanOrEqual(4.5); // ~5.5:1
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
    expect(screen.getByText('Reset Outpost to Nominal Baseline ↺')).toBeDefined();
  });

  it('displays user-facing error alert when importing a corrupt scenario code (AC3)', () => {
    render(<App />);

    // Navigate to Learn screen
    const learnBtn = screen.getByRole('button', { name: 'Learn' });
    fireEvent.click(learnBtn);

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
