// Missions page and debriefs: content rules, hint + free retry, explanation + source after
// every answer, progress saved for the Logbook.

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { debriefs } from '../../src/content/debriefs.ts';
import { guidedMissions } from '../../src/content/missions.ts';
import { SOURCE_LABELS } from '../../src/content/sources.ts';
import {
  getProgress,
  parseProgress,
  PROGRESS_KEY,
  recordMissionTest,
  reloadProgressForTests,
  resetProgress,
} from '../../src/state/progress.ts';
import { AppStoreProvider, initialAppState } from '../../src/state/store.tsx';
import { MissionsScreen } from '../../src/ui/screens/Missions.tsx';

beforeEach(() => {
  resetProgress();
});

describe('debrief content', () => {
  it('every mission has exactly 3 questions, each with a hint, explanation and known source', () => {
    for (const m of guidedMissions) {
      const qs = debriefs[m.id];
      expect(qs, m.id).toHaveLength(3);
      for (const q of qs) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.hint.length).toBeGreaterThan(10);
        expect(q.explanation.length).toBeGreaterThan(20);
        expect(Object.keys(SOURCE_LABELS)).toContain(q.sourceRef);
        expect(q.needsReview).toBe(true);
        q.options.forEach((o, i) => {
          if (i === q.correctIndex) expect(o.whyNot).toBeUndefined();
          else expect(o.whyNot?.length ?? 0).toBeGreaterThan(10);
        });
      }
    }
  });

  it('the right answer is not always in the same place', () => {
    const places = new Set(Object.values(debriefs).flatMap((qs) => qs.map((q) => q.correctIndex)));
    expect(places.size).toBeGreaterThan(1);
  });

  it('never says "You failed"', () => {
    expect(JSON.stringify(debriefs)).not.toMatch(/you failed/i);
  });
});

describe('Missions page', () => {
  beforeEach(() => {
    window.location.hash = '#/missions';
  });

  it('lists the five missions with a start button each', () => {
    render(<App />);
    const list = screen.getByRole('list', { name: copy.missionsPage.listLabel });
    expect(within(list).getAllByRole('heading', { level: 3 })).toHaveLength(5);
    expect(
      within(list).getAllByRole('button', { name: new RegExp(copy.missionsPage.start) }),
    ).toHaveLength(5);
  });

  it('starting a mission opens its Build step on Free build', async () => {
    render(<App />);
    const m4 = guidedMissions[3]!;
    const buttons = screen.getAllByRole('button', { name: new RegExp(copy.missionsPage.start) });
    fireEvent.click(buttons[3]!);
    expect(await screen.findByRole('heading', { name: m4.title, level: 2 })).toBeDefined();
    expect(screen.getByText(copy.flow.stepOf(2, 5))).toBeDefined();
  });

  it('shows saved progress on the card', () => {
    recordMissionTest('M2', 93, true);
    render(<App />);
    expect(screen.getByText(copy.missionsPage.best(93))).toBeDefined();
    expect(screen.getByText(copy.missionsPage.goalStar)).toBeDefined();
  });
});

describe('Debrief', () => {
  const m1 = guidedMissions[0]!;
  const q1 = debriefs.M1[0]!;

  const renderDebrief = () => {
    window.location.hash = '#/missions/M1/debrief';
    return render(
      <AppStoreProvider
        initialState={{ ...initialAppState, mission: { id: 'M1', hasTested: true, lastHome: 95 } }}
      >
        <MissionsScreen />
      </AppStoreProvider>,
    );
  };

  it('asks you to fly the mission first when it was never tested', () => {
    window.location.hash = '#/missions/M3/debrief';
    render(<App />);
    expect(screen.getByRole('heading', { name: copy.debrief.needTest })).toBeDefined();
  });

  it('a wrong answer explains why, gives a hint and the source, and allows a free retry', () => {
    renderDebrief();
    expect(screen.getByRole('heading', { name: q1.prompt })).toBeDefined();
    const wrongIdx = q1.correctIndex === 0 ? 1 : 0;
    const wrong = q1.options[wrongIdx]!;
    fireEvent.click(screen.getByRole('radio', { name: wrong.text }));
    fireEvent.click(screen.getByRole('button', { name: copy.debrief.check }));

    const status = screen.getByRole('status');
    expect(status.textContent).toContain(copy.debrief.notQuite);
    expect(status.textContent).toContain(wrong.whyNot ?? '');
    expect(status.textContent).toContain(q1.hint);
    expect(status.textContent).toContain(SOURCE_LABELS[q1.sourceRef]);
    expect(status.textContent).toContain(copy.debrief.tryAgain);
    // The tried option is locked; the others are still free to pick.
    const tried = screen.getByRole('radio', {
      name: (n: string) => n.startsWith(wrong.text) && n.includes(copy.debrief.tried),
    }) as HTMLInputElement;
    expect(tried.disabled).toBe(true);
    const right = q1.options[q1.correctIndex]!;
    expect((screen.getByRole('radio', { name: right.text }) as HTMLInputElement).disabled).toBe(
      false,
    );
  });

  it('a right answer shows the explanation and source, then all three finish the debrief', () => {
    renderDebrief();
    for (const q of debriefs.M1) {
      fireEvent.click(screen.getByRole('radio', { name: q.options[q.correctIndex]!.text }));
      fireEvent.click(screen.getByRole('button', { name: copy.debrief.check }));
      const status = screen.getByRole('status');
      expect(status.textContent).toContain(copy.debrief.right);
      expect(status.textContent).toContain(q.explanation);
      expect(status.textContent).toContain(`(${q.sourceRef})`);
      const next = screen.getByRole('button', {
        name: new RegExp(q === debriefs.M1[2] ? copy.debrief.finish : copy.debrief.next),
      });
      fireEvent.click(next);
    }
    expect(screen.getByRole('heading', { name: copy.debrief.doneTitle })).toBeDefined();
    expect(screen.getByText(copy.debrief.doneBody(m1.title))).toBeDefined();
    expect(getProgress().missions.M1?.isDebriefDone).toBe(true);
  });

  it('asks for an answer before checking', () => {
    renderDebrief();
    fireEvent.click(screen.getByRole('button', { name: copy.debrief.check }));
    expect(screen.getByRole('status').textContent).toContain(copy.debrief.pickFirst);
  });
});

describe('progress storage (localStorage, progress only)', () => {
  it('saves under one key and reloads it', () => {
    recordMissionTest('M5', 94, true);
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').missions.M5.bestHome).toBe(94);
    reloadProgressForTests();
    expect(getProgress().missions.M5).toEqual({
      bestHome: 94,
      isGoalMet: true,
      isDebriefDone: false,
    });
  });

  it('keeps the best result and never loses a reached goal', () => {
    recordMissionTest('M1', 96, true);
    recordMissionTest('M1', 40, false);
    expect(getProgress().missions.M1).toMatchObject({ bestHome: 96, isGoalMet: true });
  });

  it('drops broken or unknown data instead of crashing', () => {
    expect(parseProgress('not json')).toEqual({ version: 1, missions: {}, training: {} });
    expect(parseProgress(JSON.stringify({ version: 2 })).missions).toEqual({});
    const p = parseProgress(
      JSON.stringify({
        version: 1,
        missions: { M9: { bestHome: 5 }, M1: { bestHome: 900, isGoalMet: 'yes' } },
        training: { hack: {}, power_juggle: { plays: 2, bestScore: 7, hasCleared: true } },
      }),
    );
    expect(p.missions).toEqual({ M1: { bestHome: null, isGoalMet: false, isDebriefDone: false } });
    expect(p.training).toEqual({ power_juggle: { plays: 2, bestScore: 7, hasCleared: true } });
  });
});
