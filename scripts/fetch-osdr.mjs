// One-off developer script (AGENTS_NEW.md B10.4, F10 exception a). Never shipped in the bundle.
// Builds data/osdr_cards.json: 3 to 5 real NASA OSDR studies (source S13), one per game topic.
//
// Run: node scripts/fetch-osdr.mjs
//
// Fields used (seen in a real response from /osdr/data/search on 2026-11-14): Accession,
// Study Title, Study Description, organism, Mission. Each card keeps the study's own description
// as `evidence`; the kid-friendly `summary` is drafted by a person or agent from that evidence,
// carries needsReview: true, and is preserved across re-runs (matched by datasetId).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'data', 'osdr_cards.json');
const SEARCH = 'https://osdr.nasa.gov/osdr/data/search';
const STUDY_PAGE = (id) => `https://osdr.nasa.gov/bio/repo/data/studies/${id}`;

// Game topic -> search term. Order is the order of the cards.
const TOPICS = [
  { topic: 'astronauts', term: 'astronaut', preferOrganism: 'Homo sapiens' },
  { topic: 'radiation', term: 'space radiation' },
  { topic: 'bones', term: 'bone loss microgravity' },
  { topic: 'muscles', term: 'muscle atrophy spaceflight' },
  { topic: 'plants', term: 'plant growth spaceflight' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(term) {
  const url = `${SEARCH}?${new URLSearchParams({ term, from: '0', size: '10', type: 'cgene' })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSDR search HTTP ${res.status} for "${term}"`);
  const json = await res.json();
  return (json.hits?.hits ?? []).map((h) => h._source);
}

async function pageResolves(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
}

function firstSentences(text, n) {
  const clean = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  return parts.slice(0, n).join(' ').trim();
}

async function main() {
  const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { cards: [] };
  const keepSummary = new Map((previous.cards ?? []).map((c) => [c.datasetId, c.summary]));
  const retrievedAt = new Date().toISOString().slice(0, 10);
  const used = new Set();
  const cards = [];

  for (const t of TOPICS) {
    await sleep(800);
    const hits = (await search(t.term)).filter(
      (s) => s.Accession && s['Study Title'] && s['Study Description'] && !used.has(s.Accession),
    );
    const pick = (t.preferOrganism && hits.find((s) => s.organism === t.preferOrganism)) || hits[0];
    if (!pick) {
      console.warn(`  no study found for "${t.term}"`);
      continue;
    }
    const url = STUDY_PAGE(pick.Accession);
    if (!(await pageResolves(url))) {
      console.warn(`  skipped ${pick.Accession}: study page did not open (${url})`);
      continue;
    }
    used.add(pick.Accession);
    cards.push({
      topic: t.topic,
      datasetId: pick.Accession,
      title: pick['Study Title'],
      organism: pick.organism ?? '',
      mission: Array.isArray(pick.Mission)
        ? pick.Mission.map((m) => m.Name ?? m).join(', ')
        : String(pick.Mission?.Name ?? pick.Mission ?? ''),
      evidence: firstSentences(pick['Study Description'], 3),
      summary: keepSummary.get(pick.Accession) ?? null,
      needsReview: true,
      url,
      retrievedAt,
    });
    console.log(`  kept ${pick.Accession}: ${pick['Study Title']}`);
  }

  if (cards.length < 3) {
    console.error(`Only ${cards.length} cards found; need at least 3. Nothing written.`);
    process.exit(1);
  }
  const out = {
    source: 'S13',
    endpoint: SEARCH,
    query: TOPICS.map((t) => `${t.topic}: "${t.term}"`).join('; '),
    retrievedAt,
    cards,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote data/osdr_cards.json with ${cards.length} cards.`);
}

main().catch((err) => {
  console.error(`fetch-osdr failed: ${err.message}`);
  console.error('Retry later with: node scripts/fetch-osdr.mjs');
  process.exit(1);
});
