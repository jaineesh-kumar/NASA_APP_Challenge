// Unit tests for LearnScreen: Guided missions M1-M3, Quiz, and Concept checks
// Spec Part C (L8 AC1, AC2, AC6)

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { concepts } from '../../src/content/concepts.ts';
import { guidedMissions } from '../../src/content/missions.ts';
import { quizQuestions } from '../../src/content/quiz.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { LearnScreen } from '../../src/ui/screens/Learn.tsx';

describe('LearnScreen Component (Spec Part C L8 AC1, AC2, AC6)', () => {
  it('contains M1, M2, and M3 guided missions with one concept check each (AC1)', () => {
    expect(guidedMissions.length).toBe(3);
    const ids = guidedMissions.map((m) => m.id);
    expect(ids).toEqual(['M1', 'M2', 'M3']);

    guidedMissions.forEach((m) => {
      expect(m.design).toBeDefined();
      expect(m.rules).toBeDefined();
      expect(m.conceptCheck).toBeDefined();
      expect(m.conceptCheck.options.length).toBeGreaterThanOrEqual(2);
      expect(m.needsReview).toBe(true); // AC6
    });
  });

  it('contains 6-question quiz and every question has needsReview: true (AC2, AC6)', () => {
    expect(quizQuestions.length).toBe(6);
    quizQuestions.forEach((q) => {
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(q.needsReview).toBe(true); // AC6
    });

    Object.values(concepts).forEach((c) => {
      expect(c.needsReview).toBe(true); // AC6
    });
  });

  it('renders guided missions and allows checking answers (AC1)', () => {
    render(
      <AppStoreProvider>
        <LearnScreen />
      </AppStoreProvider>,
    );

    expect(screen.getByText('Junior Astronaut Academy')).toBeDefined();
    expect(screen.getByText('M1 Training Module')).toBeDefined();
    expect(screen.getByText('M2 Training Module')).toBeDefined();
    expect(screen.getByText('M3 Training Module')).toBeDefined();

    // Find the first option for M1 concept check and click it
    const firstOption = screen.getByText(new RegExp(guidedMissions[0]!.conceptCheck.options[0]!));
    fireEvent.click(firstOption);

    // Click Check Answer
    const checkBtn = screen.getAllByText('Check Answer')[0]!;
    fireEvent.click(checkBtn);

    // Feedback should be displayed
    expect(screen.getByText(/Review Concept Notes|Correct Astronaut Assessment/)).toBeDefined();
  });

  it('allows completing the 6-question quiz and computes readiness score (AC2)', () => {
    render(
      <AppStoreProvider>
        <LearnScreen />
      </AppStoreProvider>,
    );

    // Switch to Quiz Tab
    const quizTab = screen.getByRole('tab', { name: /Mission Quiz/ });
    fireEvent.click(quizTab);

    expect(screen.getByText('Question 1 of 6')).toBeDefined();

    // Answer questions 1 to 5 and advance
    for (let i = 0; i < 5; i++) {
      const correctOpt = quizQuestions[i]!.options[quizQuestions[i]!.correctIndex]!;
      const optionBtn = screen.getByText((content) => content.includes(correctOpt));
      fireEvent.click(optionBtn);

      const nextBtn = screen.getByText('Next Question →');
      fireEvent.click(nextBtn);
    }

    // Question 6
    expect(screen.getByText('Question 6 of 6')).toBeDefined();
    const correctOpt6 = quizQuestions[5]!.options[quizQuestions[5]!.correctIndex]!;
    const optionBtn6 = screen.getByText((content) => content.includes(correctOpt6));
    fireEvent.click(optionBtn6);

    // Submit Quiz
    const submitBtn = screen.getByText('Submit Mission Assessment ✓');
    fireEvent.click(submitBtn);

    // Score should be shown
    expect(screen.getByText(/Mission Readiness Score:/)).toBeDefined();
    expect(screen.getByText(/6 \/ 6/)).toBeDefined();
    expect(screen.getByText('Retake Quiz')).toBeDefined();
  });
});
