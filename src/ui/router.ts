// Hash-based routes (#/, #/missions/M2, ...). No router library (Spec B2): the page listens to
// `hashchange` through useSyncExternalStore. Hashes that are not routes (no leading "#/") are
// ignored, so in-page anchors never knock the player off their page.

import { useSyncExternalStore } from 'react';

export type RouteId =
  | 'home'
  | 'how-to-play'
  | 'training'
  | 'missions'
  | 'free-build'
  | 'logbook'
  | 'words'
  | 'teachers'
  | 'data'
  | 'mission-day'
  | 'quiz'
  | 'sim';

/** Every page, in menu order. */
export const ROUTE_IDS: readonly RouteId[] = [
  'home',
  'how-to-play',
  'missions',
  'mission-day',
  'training',
  'free-build',
  'sim',
  'logbook',
  'words',
  'teachers',
  'data',
];

export interface Route {
  id: RouteId;
  /** Path parts after the page, e.g. ['M2', 'debrief'] for #/missions/M2/debrief. */
  sub: readonly string[];
}

/** Menu groups: a plain link, or a dropdown of related pages. */
export type NavGroupId = 'play' | 'learn' | 'about';
export type NavItem =
  { kind: 'link'; id: RouteId } | { kind: 'group'; id: NavGroupId; pages: readonly RouteId[] };

/** The main menu, in order. Every page in ROUTE_IDS appears exactly once. */
export const NAV_ITEMS: readonly NavItem[] = [
  { kind: 'link', id: 'home' },
  { kind: 'group', id: 'play', pages: ['missions', 'mission-day', 'free-build'] },
  { kind: 'link', id: 'sim' },
  { kind: 'group', id: 'learn', pages: ['how-to-play', 'training', 'words'] },
  { kind: 'link', id: 'logbook' },
  { kind: 'group', id: 'about', pages: ['data', 'teachers'] },
];

const HOME: Route = { id: 'home', sub: [] };

/** Pages reached from a header button instead of the menu. */
export const EXTRA_ROUTE_IDS: readonly RouteId[] = ['quiz'];

function isRouteId(s: string): s is RouteId {
  return ([...ROUTE_IDS, ...EXTRA_ROUTE_IDS] as readonly string[]).includes(s);
}

/** Reads a location hash. Returns null for hashes that are not routes (e.g. "#main-content"). */
export function parseHash(hash: string): Route | null {
  if (hash === '' || hash === '#' || hash === '#/') return HOME;
  if (!hash.startsWith('#/')) return null;
  const parts = hash
    .slice(2)
    .split('/')
    .filter((p) => p !== '')
    .map((p) => decodeURIComponent(p));
  const [first, ...rest] = parts;
  if (first === undefined) return HOME;
  // Unknown pages fall back to the landing page rather than a dead end.
  if (!isRouteId(first) || first === 'home') return HOME;
  return { id: first, sub: rest };
}

export function hrefFor(id: RouteId, ...sub: string[]): string {
  if (id === 'home') return '#/';
  return `#/${[id, ...sub].map((p) => encodeURIComponent(p)).join('/')}`;
}

export function navigate(id: RouteId, ...sub: string[]): void {
  const next = hrefFor(id, ...sub);
  if (window.location.hash !== next) window.location.hash = next;
}

let lastRoute: Route = HOME;
let lastHash: string | null = null;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function snapshot(): Route {
  const hash = window.location.hash;
  if (hash !== lastHash) {
    lastHash = hash;
    const parsed = parseHash(hash);
    if (parsed) lastRoute = parsed;
  }
  return lastRoute;
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot, () => HOME);
}
