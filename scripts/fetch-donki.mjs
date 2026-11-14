// One-off developer script (AGENTS_NEW.md B10.2, F10 exception a). Never shipped in the bundle.
// Builds data/donki_archive.json: up to 5 real solar energetic particle (SEP) events from NASA
// DONKI (source S12) that have a linked solar flare with a recorded class.
//
// Run:  node scripts/fetch-donki.mjs            (uses DEMO_KEY, tightly rate-limited)
//       NASA_API_KEY=... node scripts/fetch-donki.mjs
//
// Flare class source, in order:
//   1. /DONKI/FLR  (field `classType`, matched by `flrID` to the SEP's linkedEvents)
//   2. DONKI SEP notifications (/DONKI/notifications?type=SEP): the "Notes" line
//      "associated with an <class> flare ... with ID <flrID>", accepted only when that flrID is
//      also in the SEP event's linkedEvents. The notification id and URL are stored as evidence.
// Selection rule (documented in docs/DATA_USED.md): walk backwards from the retrieval date in
// 30-day windows; keep SEP events whose linked flare class is C, M or X; at most one event per
// calendar month (the first in that month); stop at 5.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const BASE = 'https://api.nasa.gov/DONKI';
const WINDOW_DAYS = 30; // DONKI truncates longer windows (B10.2)
const MAX_EVENTS = 5;
const MAX_WINDOWS = 36; // stop after 3 years of search
const PAUSE_MS = 1500;
const CACHE_DIR = join(root, 'node_modules', '.cache', 'donki');
const DAY_MS = 86_400_000;
const CLASS_RE = /associated with an? ([CMX]\d+(?:\.\d+)?) flare.*?with ID (\S+?FLR-\d+)/s;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const day = (ms) => new Date(ms).toISOString().slice(0, 10);

async function getJson(path, params) {
  const qs = new URLSearchParams({ ...params, api_key: KEY });
  const cacheFile = join(
    CACHE_DIR,
    `${path.replace(/\W/g, '_')}_${new URLSearchParams(params)}.json`,
  );
  if (existsSync(cacheFile)) return JSON.parse(readFileSync(cacheFile, 'utf8'));
  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(PAUSE_MS);
    const res = await fetch(`${BASE}/${path}?${qs}`);
    const text = await res.text();
    if (res.ok) {
      const data = text.trim() ? JSON.parse(text) : [];
      mkdirSync(CACHE_DIR, { recursive: true });
      writeFileSync(cacheFile, JSON.stringify(data));
      return data;
    }
    if (res.status === 404) return { unavailable: true, status: 404 };
    console.warn(`  ${path} ${params.startDate}: HTTP ${res.status}, attempt ${attempt}/3`);
    if (res.status !== 429 && res.status < 500)
      throw new Error(`${path} HTTP ${res.status}: ${text.slice(0, 160)}`);
    await sleep(PAUSE_MS * 4 * attempt);
  }
  throw new Error(`${path} failed 3 times for ${params.startDate}..${params.endDate}`);
}

async function main() {
  const retrievedAt = day(Date.now());
  const endMs = Date.parse(`${retrievedAt}T00:00:00Z`);
  const events = [];
  const months = new Set();
  let flrAvailable = true;
  let windows = 0;

  for (
    let to = endMs;
    events.length < MAX_EVENTS && windows < MAX_WINDOWS;
    to -= WINDOW_DAYS * DAY_MS, windows++
  ) {
    const range = { startDate: day(to - (WINDOW_DAYS - 1) * DAY_MS), endDate: day(to) };
    const seps = await getJson('SEP', range);
    if (!Array.isArray(seps) || seps.length === 0) continue;

    const flareClass = new Map(); // flrID -> { cls, evidence }
    if (flrAvailable) {
      const flr = await getJson('FLR', range);
      if (Array.isArray(flr)) {
        for (const f of flr)
          if (f.flrID && f.classType)
            flareClass.set(f.flrID, {
              cls: f.classType,
              evidence: { kind: 'FLR', id: f.flrID, url: f.link },
            });
      } else {
        flrAvailable = false;
        console.warn('  /DONKI/FLR returned 404; using DONKI SEP notifications for flare class.');
      }
    }
    const notes = await getJson('notifications', { ...range, type: 'SEP' });
    for (const n of Array.isArray(notes) ? notes : []) {
      const m = CLASS_RE.exec(n.messageBody ?? '');
      if (m && !flareClass.has(m[2])) {
        flareClass.set(m[2], {
          cls: m[1],
          evidence: { kind: 'notification', id: n.messageID, url: n.messageURL },
        });
      }
    }

    // Newest first inside the window too.
    for (const s of [...seps].sort((a, b) => b.eventTime.localeCompare(a.eventTime))) {
      if (events.length >= MAX_EVENTS) break;
      const month = s.eventTime.slice(0, 7);
      if (months.has(month)) continue;
      const linked = (s.linkedEvents ?? [])
        .map((l) => l.activityID)
        .filter((id) => /FLR-\d+$/.test(id));
      const hit = linked.map((id) => ({ id, info: flareClass.get(id) })).find((x) => x.info);
      if (!hit || !/^[CMX]/.test(hit.info.cls)) continue;
      months.add(month);
      events.push({
        id: s.sepID,
        eventTime: s.eventTime,
        flareClass: hit.info.cls,
        flareId: hit.id,
        link: s.link,
        classEvidence: hit.info.evidence,
      });
      console.log(
        `  kept ${s.sepID}  flare ${hit.info.cls} (${hit.id}) via ${hit.info.evidence.kind} ${hit.info.evidence.id}`,
      );
    }
  }

  if (events.length === 0) {
    console.error('No qualifying events found. Nothing written.');
    process.exit(1);
  }

  const out = {
    source: 'S12',
    endpoint: `${BASE}/SEP (+ ${flrAvailable ? '/FLR' : '/notifications?type=SEP'} for flare class)`,
    query: `windows of ${WINDOW_DAYS} days backwards from ${retrievedAt}; C/M/X linked flare; one event per month; max ${MAX_EVENTS}`,
    retrievedAt,
    events,
  };
  writeFileSync(join(root, 'data', 'donki_archive.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(
    `Wrote data/donki_archive.json with ${events.length} events (searched ${windows + 1} windows).`,
  );
}

main().catch((err) => {
  console.error(`fetch-donki failed: ${err.message}`);
  console.error('Retry later with:  NASA_API_KEY=<your key> node scripts/fetch-donki.mjs');
  process.exit(1);
});
