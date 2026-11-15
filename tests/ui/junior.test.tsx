import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { concepts } from '../../src/content/concepts.ts';
import { quizQuestions } from '../../src/content/quiz.ts';
import { guidedMissions, missionPresets } from '../../src/content/missions.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { DesignScreen } from '../../src/ui/screens/Design.tsx';
import { RehearseScreen } from '../../src/ui/screens/Rehearse.tsx';

/** Every string reachable from a content module, functions called with sample values. */
function allText(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (typeof value === 'function') {
    const fn = value as (...a: unknown[]) => unknown;
    const r = fn(3, 4, 5);
    if (typeof r === 'string') out.push(r);
  } else if (Array.isArray(value)) value.forEach((v) => allText(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allText(v, out));
  return out;
}

describe('Junior Mode (L11)', () => {
  it('AC1: Junior is the default and the header no longer shows a Junior/Planner switch', () => {
    // Team request 2026-11-15: the switch was removed from the header (ADR-017).
    expect(initialAppState.mode).toBe('junior');
    render(<App />);
    expect(screen.queryByRole('radio', { name: copy.mode.junior })).toBeNull();
    expect(screen.queryByRole('radio', { name: copy.mode.planner })).toBeNull();
  });

  it('AC6: no content ever says "You failed"', () => {
    const text = allText([copy, concepts, quizQuestions, missionPresets, guidedMissions]).join(
      '\n',
    );
    expect(text).not.toMatch(/you failed/i);
    expect(text).not.toMatch(/\bfailure\b.*\byou\b/i);
  });

  it('AC8: every science word from B9 has a tap-to-explain term in context', () => {
    const b9 = [
      'Radiation dose',
      'Solar storm',
      'Battery',
      'Oxygen scrubber',
      'Regolith',
      'Recycling loop',
    ];
    const glossary = copy.glossary.terms.map((t) => t.term);
    for (const term of b9) expect(glossary).toContain(term);
    render(
      <AppStoreProvider>
        <DesignScreen />
        <RehearseScreen />
      </AppStoreProvider>,
    );
    for (const term of [
      'Battery',
      'Regolith',
      'Recycling loop',
      'Oxygen scrubber',
      'Solar storm',
    ]) {
      expect(screen.getByText(term, { selector: 'summary' })).toBeDefined();
    }
  });
});
