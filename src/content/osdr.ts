// Real astronaut research cards from NASA OSDR (source S13), archived by scripts/fetch-osdr.mjs.
// The summaries are agent-drafted from each study's own description and carry needsReview: true.

import raw from '../../data/osdr_cards.json' with { type: 'json' };

export interface OsdrCard {
  topic: string;
  datasetId: string;
  title: string;
  organism: string;
  summary: string;
  url: string;
  retrievedAt: string;
  needsReview: true;
}

function load(): { retrievedAt: string; cards: OsdrCard[] } {
  if (raw.source !== 'S13')
    throw new Error('osdr_cards.json must come from source S13 (NASA OSDR).');
  const cards = raw.cards.map((c, i) => {
    if (!/^OSD-\d+$/.test(c.datasetId)) throw new Error(`OSDR card ${i}: bad dataset id.`);
    if (!/^https:\/\/osdr\.nasa\.gov\//.test(c.url))
      throw new Error(`OSDR card ${i}: url must be on osdr.nasa.gov.`);
    if (typeof c.summary !== 'string' || c.summary.trim() === '')
      throw new Error(`OSDR card ${i}: summary missing.`);
    return {
      topic: c.topic,
      datasetId: c.datasetId,
      title: c.title,
      organism: c.organism,
      summary: c.summary,
      url: c.url,
      retrievedAt: c.retrievedAt,
      needsReview: true as const,
    };
  });
  if (cards.length < 3 || cards.length > 5) throw new Error('OSDR archive must hold 3 to 5 cards.');
  return { retrievedAt: raw.retrievedAt, cards };
}

export const osdr = load();

/** The card that best matches what went wrong in a mission. */
export function cardFor(cause: string | null): OsdrCard {
  const topic = cause === 'dose' ? 'radiation' : cause === 'food' ? 'plants' : 'astronauts';
  const found = osdr.cards.find((c) => c.topic === topic) ?? osdr.cards[0];
  if (!found) throw new Error('No OSDR cards loaded.');
  return found;
}
