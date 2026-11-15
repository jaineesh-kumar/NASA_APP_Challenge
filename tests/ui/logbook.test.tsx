// Logbook (badges + progress), Space Words, Data and science, For teachers.

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { badges } from '../../src/content/badges.ts';
import { copy } from '../../src/content/copy.ts';
import { getDonkiArchive } from '../../src/engine/params.ts';
import {
  getProgress,
  PROGRESS_KEY,
  recordDebriefDone,
  recordMissionTest,
  recordTrainingRound,
  resetProgress,
} from '../../src/state/progress.ts';
import { stormDate } from '../../src/ui/components/StormPicker.tsx';

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

describe('Logbook', () => {
  beforeEach(() => {
    window.location.hash = '#/logbook';
  });

  it('starts with no badges and shows every badge with how to earn it', () => {
    render(<App />);
    expect(screen.getByText(copy.logbook.badgesCount(0, badges.length))).toBeDefined();
    for (const b of badges) expect(screen.getByText(b.howTo)).toBeDefined();
  });

  it('earns badges from progress and shows mission and training rows', () => {
    recordMissionTest('M1', 96, true);
    recordDebriefDone('M1');
    recordTrainingRound('storm_shelter', 10, true);
    render(<App />);
    const earned = badges.filter((b) => b.isEarned(getProgress())).map((b) => b.id);
    expect(earned).toEqual(['first_test', 'first_debrief', 'storm_ready']);
    expect(screen.getByText(copy.logbook.badgesCount(3, badges.length))).toBeDefined();
    const row = screen.getByRole('row', { name: new RegExp('Mission 1') });
    expect(within(row).getByText(copy.logbook.bestOf(96))).toBeDefined();
  });

  it('asks before clearing, then empties the logbook', () => {
    recordMissionTest('M2', 80, false);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: copy.logbook.clear }));
    fireEvent.click(screen.getByRole('button', { name: copy.logbook.clearNo }));
    expect(getProgress().missions.M2).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: copy.logbook.clear }));
    fireEvent.click(screen.getByRole('button', { name: copy.logbook.clearYes }));
    expect(getProgress().missions).toEqual({});
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
    expect(screen.getByText(copy.logbook.cleared)).toBeDefined();
  });

  it('stores only progress in localStorage, under one key (F15)', () => {
    recordMissionTest('M3', 94, true);
    recordTrainingRound('power_juggle', 56, true);
    expect(Object.keys(localStorage)).toEqual([PROGRESS_KEY]);
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
    expect(Object.keys(saved).sort()).toEqual(['missions', 'training', 'version']);
  });

  it('every badge has a name and kind wording', () => {
    for (const b of badges) {
      expect(b.name.length).toBeGreaterThan(2);
      expect(b.needsReview).toBe(true);
      expect(`${b.name} ${b.howTo}`).not.toMatch(/fail/i);
    }
  });
});

describe('Space words', () => {
  it('lists every glossary term, A to Z', () => {
    window.location.hash = '#/words';
    render(<App />);
    const terms = screen.getAllByRole('term').map((t) => t.textContent ?? '');
    expect(terms).toHaveLength(copy.glossary.terms.length);
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
  });
});

describe('Data and science page', () => {
  it('lists every archived storm, labelled archived and not live, plus the model card', () => {
    window.location.hash = '#/data';
    render(<App />);
    const archive = getDonkiArchive();
    expect(
      screen.getAllByText(copy.storms.archivedLabel(archive.retrievedAt)).length,
    ).toBeGreaterThanOrEqual(1);
    // Every storm is a flash card: its date, flare class and a replay button.
    for (const e of archive.events) {
      const date = stormDate(e);
      expect(screen.getAllByRole('heading', { name: date }).length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText(copy.dataPage.stormFlare(e.flareClass)).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: copy.dataPage.replayButton(date) })).toBeDefined();
    }
    for (const item of copy.dataPage.honesty) {
      expect(screen.getByRole('heading', { name: item.title })).toBeDefined();
      expect(screen.getByText(item.text)).toBeDefined();
    }
    // The jump buttons sit above the sections.
    const jump = screen.getByRole('navigation', { name: copy.dataPage.jumpLabel });
    for (const label of Object.values(copy.dataPage.jump))
      expect(within(jump).getByRole('button', { name: label })).toBeDefined();
    expect(screen.getByRole('heading', { name: copy.osdr.title })).toBeDefined();
    expect(screen.getByRole('heading', { name: copy.modelCard.heading })).toBeDefined();
  });
});

describe('For teachers page', () => {
  it('has a lesson plan and the classroom tools', () => {
    window.location.hash = '#/teachers';
    render(<App />);
    expect(screen.getByRole('heading', { name: copy.teachers.planTitle })).toBeDefined();
    expect(screen.getByRole('heading', { name: copy.teachers.toolsTitle })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Share Scenario Codes/i })).toBeDefined();
  });
});
