// Sim page (#/sim): what the 3D Sim is, how to play it, its five missions with real screenshots,
// a picture gallery and tips. The Launch buttons leave the app for the standalone 3D page in
// public/sim (ADR-015). Screenshots were captured from that page (public/images/sim).
// Cards slide in as they scroll into view; with reduced motion, or without
// IntersectionObserver (tests), everything is simply shown.

import React, { useEffect, useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { SIM_HREF } from '../components/Header.tsx';
import { Icon, IconName } from '../components/Icon.tsx';

const s = copy.simPage;
const shotUrl = (shot: string) => `${import.meta.env.BASE_URL}images/sim/${shot}.png`;

const TIP_ICON: Readonly<Record<string, IconName>> = {
  phone: 'phone',
  graphics: 'star',
  skip: 'next',
  wifi: 'antenna',
};

/** Adds "is-visible" to every .reveal element inside the page when it scrolls into view. */
function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('.reveal'));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      items.forEach((i) => i.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [root]);
}

/** The small picture on each "How to play" card. */
const HowArt: React.FC<{ kind: string }> = ({ kind }) => {
  if (kind === 'keys')
    return (
      <div className="how-art how-keys" aria-hidden="true">
        <span className="keycap k-w">W</span>
        <span className="keycap k-a">A</span>
        <span className="keycap k-s">S</span>
        <span className="keycap k-d">D</span>
      </div>
    );
  if (kind === 'beam')
    return (
      <div className="how-art how-beam" aria-hidden="true">
        <span className="beam-ray" />
        <span className="beam-arrow">
          <Icon name="up" size={22} />
        </span>
      </div>
    );
  if (kind === 'hold')
    return (
      <div className="how-art how-hold" aria-hidden="true">
        <span className="keycap keycap-big">E</span>
        <span className="hold-bar">
          <span />
        </span>
      </div>
    );
  return (
    <div className="how-art how-oxygen" aria-hidden="true">
      <span className="o2-label">O₂</span>
      <span className="o2-bar">
        <span />
      </span>
    </div>
  );
};

/** The hero picture: a drawn Moon with a rocket floating above it. */
const HeroArt: React.FC = () => (
  <div className="sim-hero-art" aria-hidden="true">
    <span className="sim-star st1" />
    <span className="sim-star st2" />
    <span className="sim-star st3" />
    <span className="sim-star st4" />
    <span className="sim-star st5" />
    <svg className="sim-moon" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill="#e7ebf5" />
      <circle cx="70" cy="70" r="18" fill="#c9d2e6" />
      <circle cx="132" cy="122" r="26" fill="#c9d2e6" />
      <circle cx="62" cy="138" r="11" fill="#c9d2e6" />
      <circle cx="140" cy="60" r="8" fill="#c9d2e6" />
    </svg>
    <svg className="sim-rocket" viewBox="0 0 64 120">
      <path d="M32 4c14 12 20 30 18 52l-8 12H22l-8-12C12 34 18 16 32 4Z" fill="#ffffff" />
      <circle cx="32" cy="40" r="8" fill="#0f6e78" stroke="#14245c" strokeWidth="3" />
      <path d="M14 56 4 78l14-4M50 56l10 22-14-4" fill="#cc2a1f" />
      <path className="sim-flame" d="M24 70h16l-8 30Z" fill="#ffc233" />
    </svg>
    <img className="sim-hero-shot" src={shotUrl('sim-landing')} alt={s.heroAlt} />
  </div>
);

export const SimScreen: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(0);
  useReveal(pageRef);

  const current = s.gallery[shown] ?? s.gallery[0];

  const toHow = () => {
    const el = howRef.current;
    if (!el) return;
    el.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  return (
    <div className="page sim-page" ref={pageRef}>
      <section className="sim-hero" aria-labelledby="sim-title">
        <div className="sim-hero-text">
          <p className="sim-kicker">
            <Icon name="rocket" size={16} /> {s.kicker}
          </p>
          <h2 id="sim-title" className="sim-title">
            {s.title}
          </h2>
          <p className="sim-lead">{s.lead}</p>
          <div className="sim-cta">
            <a className="btn-link btn-big sim-launch" href={SIM_HREF}>
              <Icon name="rocket" size={22} /> {s.launch}
            </a>
            <button type="button" className="btn-link btn-big sim-how-btn" onClick={toHow}>
              <Icon name="down" size={20} /> {s.howButton}
            </button>
          </div>
          <ul className="sim-stats">
            {s.stats.map((st) => (
              <li key={st.label}>
                <span className="sim-stat-value">{st.value}</span>
                <span className="sim-stat-label">{st.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <HeroArt />
      </section>

      <section
        ref={howRef}
        tabIndex={-1}
        className="sim-section sim-section--how"
        aria-labelledby="sim-how-title"
      >
        <header className="sim-section-head reveal">
          <span className="sim-section-icon" aria-hidden="true">
            <Icon name="play" size={24} />
          </span>
          <div>
            <h3 id="sim-how-title">{s.howTitle}</h3>
            <p>{s.howLead}</p>
          </div>
        </header>
        <ol className="sim-how-grid">
          {s.how.map((h, i) => (
            <li
              key={h.title}
              className="sim-flash reveal"
              style={{ '--delay': `${i * 90}ms` } as React.CSSProperties}
            >
              <span className="sim-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <HowArt kind={h.icon} />
              <h4>{h.title}</h4>
              <p>{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sim-section sim-section--missions" aria-labelledby="sim-missions-title">
        <header className="sim-section-head reveal">
          <span className="sim-section-icon" aria-hidden="true">
            <Icon name="flag" size={24} />
          </span>
          <div>
            <h3 id="sim-missions-title">{s.missionsTitle}</h3>
            <p>{s.missionsLead}</p>
          </div>
        </header>
        <ol className="sim-mission-list">
          {s.missions.map((m, i) => (
            <li
              key={m.title}
              className="sim-mission reveal"
              style={{ '--delay': `${(i % 2) * 90}ms` } as React.CSSProperties}
            >
              <div className="sim-mission-shot">
                <img src={shotUrl(m.shot)} alt={m.alt} loading="lazy" />
              </div>
              <div className="sim-mission-body">
                <p className="sim-mission-num">{s.missionLabel(i + 1)}</p>
                <h4>{m.title}</h4>
                <p>{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sim-section sim-section--gallery" aria-labelledby="sim-gallery-title">
        <header className="sim-section-head reveal">
          <span className="sim-section-icon" aria-hidden="true">
            <Icon name="star" size={24} />
          </span>
          <div>
            <h3 id="sim-gallery-title">{s.galleryTitle}</h3>
            <p>{s.galleryLead}</p>
          </div>
        </header>
        <div className="sim-gallery reveal">
          <figure className="sim-gallery-main">
            <img key={current?.shot} src={shotUrl(current?.shot ?? '')} alt={current?.alt ?? ''} />
            <figcaption>{current?.title}</figcaption>
          </figure>
          <ul className="sim-thumbs">
            {s.gallery.map((g, i) => (
              <li key={g.shot}>
                <button
                  type="button"
                  className="sim-thumb"
                  aria-pressed={i === shown}
                  aria-label={s.galleryShow(g.title)}
                  onClick={() => setShown(i)}
                >
                  <img src={shotUrl(g.shot)} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sim-section sim-section--tips" aria-labelledby="sim-tips-title">
        <header className="sim-section-head reveal">
          <span className="sim-section-icon" aria-hidden="true">
            <Icon name="bulb" size={24} />
          </span>
          <div>
            <h3 id="sim-tips-title">{s.tipsTitle}</h3>
          </div>
        </header>
        <ul className="sim-tips-grid">
          {s.tips.map((t, i) => (
            <li
              key={t.title}
              className="sim-tip reveal"
              style={{ '--delay': `${i * 80}ms` } as React.CSSProperties}
            >
              <span className="sim-tip-icon" aria-hidden="true">
                <Icon name={TIP_ICON[t.icon] ?? 'star'} size={22} />
              </span>
              <h4>{t.title}</h4>
              <p>{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sim-ready reveal" aria-labelledby="sim-ready-title">
        <span className="sim-ready-rocket" aria-hidden="true">
          <Icon name="rocket" size={40} />
        </span>
        <h3 id="sim-ready-title">{s.readyTitle}</h3>
        <p>{s.readyText}</p>
        <a className="btn-link btn-big sim-launch" href={SIM_HREF}>
          <Icon name="rocket" size={22} /> {s.launch}
        </a>
        <p className="sim-opens-note">{s.opensNote}</p>
      </section>
    </div>
  );
};
