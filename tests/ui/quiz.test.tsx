// Quiz cards (#/quiz): the header button opens it, Next needs an answer, one card per
// question, and the last card shows the score with every explanation.

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { quizQuestions } from '../../src/content/quiz.ts';

const t = copy.quizCards;

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Quiz', () => {
  it('the header Quiz button links to the quiz page', () => {
    window.location.hash = '#/';
    render(<App />);
    const link = screen.getByRole('link', { name: new RegExp(t.button) });
    expect(link.getAttribute('href')).toBe('#/quiz');
  });

  it('asks for an answer, shows one card at a time and ends with the score', () => {
    window.location.hash = '#/quiz';
    render(<App />);
    const total = quizQuestions.length;

    fireEvent.click(screen.getByRole('button', { name: new RegExp(t.next) }));
    expect(screen.getByText(t.pickFirst)).toBeDefined();

    quizQuestions.forEach((q, i) => {
      expect(screen.getByText(t.progress(i + 1, total))).toBeDefined();
      expect(screen.getByRole('heading', { name: q.question })).toBeDefined();
      // Answer the first question right, all the others with the first option.
      const pick = i === 0 ? q.correctIndex : 0;
      fireEvent.click(screen.getByRole('radio', { name: q.options[pick] }));
      const label = i === total - 1 ? t.finish : t.next;
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
      act(() => {
        vi.runAllTimers();
      });
    });

    const expected = quizQuestions.filter((q, i) => (i === 0 ? true : q.correctIndex === 0)).length;
    const result = screen.getByRole('region', { name: t.resultTitle });
    expect(within(result).getByText(t.score(expected, total))).toBeDefined();
    for (const q of quizQuestions) expect(within(result).getByText(q.explanation)).toBeDefined();
  });
});

describe('Clip descriptions', () => {
  it('a clip shows its short description under the caption', () => {
    window.location.hash = '#/missions';
    render(<App />);
    expect(screen.getByText(copy.media.about['night-falls'] ?? '')).toBeDefined();
  });
});
