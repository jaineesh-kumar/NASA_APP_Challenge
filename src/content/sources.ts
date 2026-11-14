// Short, kid-readable names for the source ids in docs/SOURCES.md (A5.5). No new sources here:
// every id is a row of that table. Shown next to every debrief answer.

export type SourceId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'S05'
  | 'S06'
  | 'S07'
  | 'S08'
  | 'S09'
  | 'S10'
  | 'S11'
  | 'S12'
  | 'S13'
  | 'S14'
  | 'ASSUMPTION'
  | 'DERIVED';

export const SOURCE_LABELS: Record<SourceId, string> = {
  S01: 'NASA Life Support Baseline Values and Assumptions Document (BVAD), 2018',
  S02: 'Zhang and others (2020), first radiation measurements on the Moon’s surface, Chang’e-4',
  S03: 'Ross and others (2021), sunlight on the peaks near the Moon’s south pole',
  S04: 'NASA fact sheet: space station life support (ECLSS)',
  S05: 'NASA: Sabatier carbon dioxide system',
  S06: 'NASA Probabilistic Risk Assessment Procedures Guide (2011)',
  S07: 'Clark and others (2016), digital games and learning',
  S08: 'Frontiers in Space Technologies (2024), space station life support',
  S09: 'Wood (2017), “Peaks of Eternal Light”, Sky & Telescope',
  S10: 'Life support sizing reference (cites NASA standards)',
  S11: 'NASA-STD-3001 crew health standards (not yet checked by our team)',
  S12: 'NASA DONKI space weather database (archived copy)',
  S13: 'NASA Open Science Data Repository, OSDR (archived copy)',
  S14: 'NASA Space Apps Challenge 2026 challenge page',
  ASSUMPTION: 'Our game rule (an illustrative choice by our team)',
  DERIVED: 'Worked out from basic physics',
};
