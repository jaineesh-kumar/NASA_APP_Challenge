import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import raw from '../../data/osdr_cards.json' with { type: 'json' };
import { copy } from '../../src/content/copy.ts';
import { cardFor, osdr } from '../../src/content/osdr.ts';
import { AppStoreProvider } from '../../src/state/store.tsx';
import { DataPanel } from '../../src/ui/components/DataPanel.tsx';
import { LearnScreen } from '../../src/ui/screens/Learn.tsx';

describe('NASA OSDR cards (L13)', () => {
  it('AC1: 3 to 5 cards, each with dataset id, URL, retrieval date and its source evidence', () => {
    expect(raw.source).toBe('S13');
    expect(raw.cards.length).toBeGreaterThanOrEqual(3);
    expect(raw.cards.length).toBeLessThanOrEqual(5);
    for (const c of raw.cards) {
      expect(c.datasetId).toMatch(/^OSD-\d+$/);
      expect(c.url).toBe(`https://osdr.nasa.gov/bio/repo/data/studies/${c.datasetId}`);
      expect(c.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.evidence.length).toBeGreaterThan(40); // the study's own description, kept as evidence
      expect(c.needsReview).toBe(true); // agent-drafted summary (B9, B10.4)
    }
    expect(new Set(raw.cards.map((c) => c.datasetId)).size).toBe(raw.cards.length);
  });

  it('AC2: the cards appear in Learn as "Real astronaut finding", labelled archived', () => {
    render(
      <AppStoreProvider>
        <LearnScreen />
      </AppStoreProvider>,
    );
    const section = screen.getByRole('region', { name: copy.osdr.title });
    expect(within(section).getAllByText(copy.osdr.label)).toHaveLength(osdr.cards.length);
    expect(
      within(section).getByText(copy.osdr.archived(osdr.retrievedAt), { exact: false }),
    ).toBeDefined();
    for (const c of osdr.cards) {
      expect(
        within(section)
          .getAllByRole('link', { name: copy.osdr.link })
          .some((a) => a.getAttribute('href') === c.url),
      ).toBe(true);
    }
  });

  it('Review picks the card that matches what went wrong', () => {
    expect(cardFor('dose').topic).toBe('radiation');
    expect(cardFor('food').topic).toBe('plants');
    expect(cardFor(null).topic).toBe('astronauts');
  });

  it('AC3: the Data panel lists DONKI and OSDR as archived datasets', () => {
    render(<DataPanel />);
    expect(screen.getByRole('link', { name: /DONKI/ })).toBeDefined();
    expect(screen.getByRole('link', { name: /OSDR/ })).toBeDefined();
    expect(screen.getAllByText(/Archived, retrieved/)).toHaveLength(2);
  });
});
