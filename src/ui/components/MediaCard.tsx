// MediaCard: one image or short video in a fixed-ratio card with a caption bar underneath
// (never text over the media; the video's Play/Pause button sits in the bar too). Images
// lazy-load with width and height set, so nothing jumps. Videos are muted, looping and inline;
// they never autoplay when the player asks for reduced motion (the poster shows instead), and
// they pause when scrolled out of view. A missing or broken file shows a flat placeholder.

import React, { useEffect, useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { media, MediaEntry, MediaId, MediaRatio } from '../../content/media.ts';
import { Icon } from './Icon.tsx';

/** URL for a file in public/, working on a GitHub Pages sub-path too. */
export function mediaUrl(entry: MediaEntry): string {
  return `${import.meta.env.BASE_URL}${encodeURI(entry.file)}`;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

interface Props {
  id: MediaId;
  caption?: string;
  ratio?: MediaRatio;
  /** Videos only: start playing when visible (default) or wait for the Play button. */
  autoPlay?: boolean;
  /** Purely decorative: hidden from screen readers, no caption bar. */
  decorative?: boolean;
  /** An extra control shown in the caption bar, next to the Play/Pause button. */
  action?: React.ReactNode;
  className?: string;
}

/** Plays the video only while it is wanted and on screen. */
function useVisiblePlayback(ref: React.RefObject<HTMLVideoElement | null>, wantsPlay: boolean) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!wantsPlay) {
      v.pause();
      return;
    }
    const tryPlay = () => {
      const p = v.play();
      // Autoplay can be refused by the browser; the poster then stays.
      if (p && typeof p.catch === 'function') p.catch(() => undefined);
    };
    if (typeof IntersectionObserver === 'undefined') {
      tryPlay();
      return () => v.pause();
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) tryPlay();
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, [ref, wantsPlay]);
}

export const MediaCard: React.FC<Props> = ({
  id,
  caption,
  ratio,
  autoPlay = true,
  decorative = false,
  action,
  className,
}) => {
  const entry = media[id];
  const isVideo = entry.kind === 'video';
  const [hasFailed, setFailed] = useState(false);
  const [wantsPlay, setWantsPlay] = useState(
    () => isVideo && autoPlay && !decorative && !prefersReducedMotion(),
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  useVisiblePlayback(videoRef, wantsPlay && !hasFailed);
  const shownRatio = ratio ?? entry.ratio;
  const m = copy.media;

  let body: React.ReactNode;
  if (hasFailed) {
    body = (
      <div
        className="media-placeholder"
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : entry.alt}
      />
    );
  } else if (!isVideo) {
    body = (
      <img
        src={mediaUrl(entry)}
        alt={decorative ? '' : entry.alt}
        width={entry.width}
        height={entry.height}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  } else {
    body = (
      <video
        ref={videoRef}
        src={mediaUrl(entry)}
        poster={entry.poster ? mediaUrl(media[entry.poster]) : undefined}
        width={entry.width}
        height={entry.height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={entry.alt}
        onError={() => setFailed(true)}
      />
    );
  }

  const showToggle = isVideo && !hasFailed && !decorative;
  const about = isVideo && !decorative ? m.about[id] : undefined;
  return (
    <figure
      className={`media-card${decorative ? ' is-decorative' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden={decorative ? true : undefined}
      data-media-id={id}
    >
      <div className="media-frame" style={{ aspectRatio: shownRatio.replace('/', ' / ') }}>
        {body}
      </div>
      {!decorative && (caption || showToggle || action) ? (
        <figcaption>
          <span className="media-caption-text">
            <span>{caption}</span>
            {about ? <span className="media-about">{about}</span> : null}
          </span>
          <span className="media-actions">
            {action}
            {showToggle ? (
              <button
                type="button"
                className="media-toggle"
                aria-label={wantsPlay ? m.pauseVideo : m.playVideo}
                onClick={() => setWantsPlay((w) => !w)}
              >
                <Icon name={wantsPlay ? 'pause' : 'play'} size={18} />
                <span aria-hidden="true">{wantsPlay ? m.pause : m.play}</span>
              </button>
            ) : null}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
};
