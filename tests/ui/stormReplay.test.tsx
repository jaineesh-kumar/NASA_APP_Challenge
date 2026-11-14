// L10 on the new pages: archived DONKI storms drive gameplay and are always labelled
// "Archived NASA data, retrieved <date>. Not live." No storm is shown that is not in the archive.

import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.tsx';
import { copy } from '../../src/content/copy.ts';
import { guidedMissions } from '../../src/content/missions.ts';
import { getDonkiArchive } from '../../src/engine/params.ts';
import { runMission } from '../../src/engine/sim.ts';
import { ReplayTimeline } from '../../src/ui/components/ReplayTimeline.tsx';
import { findStorm, stormDate } from '../../src/ui/components/StormPicker.tsx';

const archive = getDonkiArchive();
const label = copy.storms.archivedLabel(archive.retrievedAt);

describe('Real Storm Replay on the site pages (L10)', () => {
  it('the archive records where and when it came from', () => {
    expect(archive.source).toBe('S12');
    expect(archive.endpoint).toMatch(/api\.nasa\.gov\/DONKI/);
    expect(archive.query.length).toBeGreaterThan(0);
    expect(archive.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const e of archive.events) {
      expect(e.link).toMatch(/^https:\/\/ccmc\.gsfc\.nasa\.gov\/DONKI\//);
      expect(e.flareClass).toMatch(/^[CMX]\d/);
    }
  });

  it('the Data page lists exactly the archived storms and replays one on the Test step', async () => {
    window.location.hash = '#/data';
    render(<App />);
    const buttons = screen.getAllByRole('button', { name: /Test my base against the storm of/ });
    expect(buttons).toHaveLength(archive.events.length);
    const storm = archive.events[0]!;
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(copy.dataPage.replayButton(stormDate(storm))),
      }),
    );
    expect(await screen.findByText(copy.flow.stepOf(4, 5))).toBeDefined();
    const picked = screen.getByRole('radio', {
      name: new RegExp(copy.storms.replayName(stormDate(storm))),
    });
    expect(
      picked.getAttribute('aria-checked') ?? String((picked as HTMLInputElement).checked),
    ).toMatch(/true/);
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
  });

  it('missions M3 and M5 replay archived storms', () => {
    for (const id of ['M3', 'M5']) {
      const m = guidedMissions.find((x) => x.id === id)!;
      expect(findStorm(m.stormMode)).not.toBeNull();
    }
  });

  it('the Review replay of a real storm carries the archived label', () => {
    const storm = archive.events[0]!;
    const stormMode = { kind: 'replay' as const, eventId: storm.id };
    const m = guidedMissions[0]!;
    const r = runMission(m.design, m.rules, 1, undefined, { trace: true, stormMode });
    render(<ReplayTimeline worstResult={r} stormMode={stormMode} />);
    const tile = screen.getByText(copy.replay.replayStorm(stormDate(storm), storm.flareClass), {
      exact: false,
    }).parentElement!;
    expect(within(tile).getByText(label)).toBeDefined();
  });
});
