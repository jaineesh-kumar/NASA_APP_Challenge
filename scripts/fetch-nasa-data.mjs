// Build-time fetch of real NASA space weather data (DONKI) into data/spaceWeather.json.
// Why build-time: the game must run offline with no network calls (AGENTS.md F10) and the
// API key must never ship to players' browsers. Run: `npm run data:fetch` (needs NASA_API_KEY
// in .env or the environment). The output is an archived snapshot, never shown as live data.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readKey() {
  if (process.env.NASA_API_KEY) return process.env.NASA_API_KEY;
  const envPath = join(root, '.env');
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('NASA_API_KEY='));
    if (line) return line.slice('NASA_API_KEY='.length).trim().replace(/^"|"$/g, '');
  }
  throw new Error('NASA_API_KEY missing. Add it to .env (see .env.example).');
}

const DAY_MS = 86_400_000;
// DONKI rejects ranges longer than 60 days.
const CHUNK_DAYS = 59;
// SEP log entries closer than this are treated as one storm (DONKI logs one entry per
// instrument / energy channel, so a single storm can appear many times).
const CLUSTER_GAP_H = 24;
// A flare or CME linked to an SEP that started earlier than this is not a usable warning.
const MAX_LEAD_H = 48;

const START = process.argv[2] ?? '2010-04-01';
const END = process.argv[3] ?? new Date().toISOString().slice(0, 10);

async function fetchChunk(key, from, to) {
  const url = `https://api.nasa.gov/DONKI/SEP?startDate=${from}&endDate=${to}&api_key=${key}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      return text.trim() ? JSON.parse(text) : [];
    }
    if (res.status !== 429 && res.status < 500) {
      throw new Error(
        `DONKI ${res.status} for ${from}..${to}: ${(await res.text()).slice(0, 200)}`,
      );
    }
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  throw new Error(`DONKI failed repeatedly for ${from}..${to}`);
}

// Activity ids look like "2024-05-09T08:45:00-FLR-001"; the prefix is the start time.
function activityStartMs(activityId) {
  const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})-(FLR|CME)-/.exec(activityId);
  return m ? Date.parse(`${m[1]}Z`) : null;
}

function parseTime(s) {
  return Date.parse(s.endsWith('Z') ? s : `${s}Z`);
}

async function main() {
  const key = readKey();
  const startMs = Date.parse(`${START}T00:00:00Z`);
  const endMs = Date.parse(`${END}T00:00:00Z`);
  const raw = [];
  for (let t = startMs; t <= endMs; t += (CHUNK_DAYS + 1) * DAY_MS) {
    const from = new Date(t).toISOString().slice(0, 10);
    const to = new Date(Math.min(t + CHUNK_DAYS * DAY_MS, endMs)).toISOString().slice(0, 10);
    raw.push(...(await fetchChunk(key, from, to)));
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  const entries = raw
    .map((e) => ({
      ms: parseTime(e.eventTime),
      id: e.sepID,
      link: e.link,
      triggers: (e.linkedEvents ?? [])
        .map((l) => activityStartMs(l.activityID))
        .filter((v) => v !== null),
    }))
    .sort((a, b) => a.ms - b.ms);

  const storms = [];
  for (const e of entries) {
    const last = storms[storms.length - 1];
    if (last && e.ms - last.lastMs <= CLUSTER_GAP_H * 3_600_000) {
      last.lastMs = e.ms;
      last.triggers.push(...e.triggers);
      last.entries += 1;
    } else {
      storms.push({
        onsetMs: e.ms,
        lastMs: e.ms,
        id: e.id,
        link: e.link,
        triggers: [...e.triggers],
        entries: 1,
      });
    }
  }

  const events = storms.map((s) => {
    const leads = s.triggers
      .map((tr) => (s.onsetMs - tr) / 3_600_000)
      .filter((h) => h >= 0 && h <= MAX_LEAD_H);
    // Earliest valid trigger = the most warning forecasters could have had.
    const leadH = leads.length > 0 ? Math.floor(Math.max(...leads)) : 0;
    return {
      onset: new Date(s.onsetMs).toISOString().slice(0, 16) + 'Z',
      leadH,
      id: s.id,
      link: s.link,
      entries: s.entries,
    };
  });

  const out = {
    source: 'S12',
    dataset:
      'NASA CCMC Space Weather Database Of Notifications, Knowledge, Information (DONKI), SEP endpoint',
    endpoint: 'https://api.nasa.gov/DONKI/SEP',
    fetchedAt: new Date().toISOString().slice(0, 10),
    coverage: { start: START, end: END },
    method: {
      clusterGapH: CLUSTER_GAP_H,
      maxLeadH: MAX_LEAD_H,
      note: 'Raw SEP entries within clusterGapH of each other are merged into one storm. leadH = onset minus the earliest linked flare or CME start (0 if none linked or outside 0..maxLeadH).',
    },
    rawEntries: raw.length,
    events,
  };
  writeFileSync(join(root, 'data', 'spaceWeather.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(`Wrote ${events.length} storms from ${raw.length} DONKI entries (${START}..${END}).`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
