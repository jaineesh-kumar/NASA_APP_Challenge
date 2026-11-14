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
  | 'data';

/** Every page, in menu order. */
export const ROUTE_IDS: readonly RouteId[] = [
  'home',
  'how-to-play',
  'missions',
  'training',
  'free-build',
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

const HOME: Route = { id: 'home', sub: [] };

function isRouteId(s: string): s is RouteId {
  return (ROUTE_IDS as readonly string[]).includes(s);
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
