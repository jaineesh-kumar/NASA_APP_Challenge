// MediaCard and the media catalog: files exist, alt text everywhere, lazy images with sizes,
// muted inline videos with a Play/Pause button, reduced motion respected, flat placeholder on error.

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { media } from '../../src/content/media.ts';
import { MediaCard, mediaUrl } from '../../src/ui/components/MediaCard.tsx';

beforeEach(() => {
  // jsdom has no media playback; record calls instead.
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Every file actually present in public/images and public/video (keys are paths).
const publicFiles = Object.keys(
  import.meta.glob('../../public/{images,video}/*', { query: '?url', import: 'default' }),
).map((k) => k.replace('../../public/', ''));

const setReducedMotion = (on: boolean) => {
  window.matchMedia = ((q: string) => ({
    matches: on && q.includes('reduce'),
    media: q,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
};

describe('media catalog', () => {
  it('lists every media file exactly once', () => {
    expect(
      Object.values(media)
        .map((e) => e.file)
        .sort(),
    ).toEqual([...publicFiles].sort());
  });

  it('every entry points at a real file in public/ and has alt text', () => {
    for (const e of Object.values(media)) {
      expect(publicFiles, e.file).toContain(e.file);
      expect(e.alt.length, e.id).toBeGreaterThan(10);
      expect(e.width).toBeGreaterThan(0);
      expect(e.height).toBeGreaterThan(0);
      if (e.poster) expect(media[e.poster].kind).toBe('image');
    }
  });

  it('builds URLs from the base URL and encodes spaces', () => {
    const url = mediaUrl(media['base-scene']);
    expect(url.startsWith(import.meta.env.BASE_URL)).toBe(true);
    expect(url).toContain('Moonbase%20Under%20a%20Starry%20Sky.png');
    expect(url).not.toContain(' ');
  });
});

describe('MediaCard', () => {
  it('shows an image lazily, with its size and alt text, and a caption bar', () => {
    render(<MediaCard id="base-scene" caption="Our base" />);
    const img = screen.getByRole('img', { name: media['base-scene'].alt }) as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('width')).toBe(String(media['base-scene'].width));
    expect(img.getAttribute('height')).toBe(String(media['base-scene'].height));
    expect(screen.getByText('Our base').closest('figcaption')).not.toBeNull();
  });

  it('shows a flat placeholder, never a broken image, when the file fails', () => {
    const { container } = render(<MediaCard id="base-scene" caption="Our base" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    const ph = screen.getByRole('img', { name: media['base-scene'].alt });
    expect(ph.className).toContain('media-placeholder');
  });

  it('plays videos muted, looping and inline, with a poster and a Pause button', () => {
    setReducedMotion(false);
    const { container } = render(<MediaCard id="crew-walkout" caption="Crew" />);
    const v = container.querySelector('video')!;
    expect(v.muted).toBe(true);
    expect(v.loop).toBe(true);
    expect(v.hasAttribute('playsinline')).toBe(true);
    expect(v.getAttribute('preload')).toBe('metadata');
    expect(v.hasAttribute('autoplay')).toBe(false);
    expect(v.getAttribute('poster')).toBe(mediaUrl(media['base-scene']));
    expect(v.getAttribute('aria-label')).toBe(media['crew-walkout'].alt);
    const btn = screen.getByRole('button', { name: copy.media.pauseVideo });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: copy.media.playVideo })).toBeDefined();
  });

  it('does not start a video when the player prefers reduced motion', () => {
    setReducedMotion(true);
    render(<MediaCard id="crew-walkout" caption="Crew" />);
    expect(screen.getByRole('button', { name: copy.media.playVideo })).toBeDefined();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    setReducedMotion(false);
  });

  it('click-to-play videos wait for the button', () => {
    setReducedMotion(false);
    render(<MediaCard id="rocket-flight" caption="Story" autoPlay={false} />);
    expect(screen.getByRole('button', { name: copy.media.playVideo })).toBeDefined();
  });

  it('decorative media is hidden from screen readers and has empty alt', () => {
    const { container } = render(<MediaCard id="moon-horizon" decorative />);
    expect(container.querySelector('figure')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(container.querySelector('figcaption')).toBeNull();
  });
});
