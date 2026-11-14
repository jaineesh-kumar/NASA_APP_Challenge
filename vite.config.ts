import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Production builds get a strict Content-Security-Policy: the game makes no network calls
// at runtime (AGENTS.md F10), so connect-src is limited to the page's own origin. Dev mode is
// left alone because Vite injects an inline HMR script there.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
  "connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'none'";

function contentSecurityPolicy(): Plugin {
  return {
    name: 'moonbase-csp',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend',
      },
    ],
  };
}

export default defineConfig({
  // Relative asset paths so the static build works on GitHub Pages sub-paths too.
  base: './',
  plugins: [react(), contentSecurityPolicy()],
  worker: { format: 'es' },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
  },
});
