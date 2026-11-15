// Header: brand (links home), the site menu, then the Quiz and Sim buttons and the real-data badge.
// The menu groups related pages into dropdowns (Play, Learn, About; NAV_ITEMS in router.ts).
// Wide screens: brand, menu and buttons share one row. Mid-size: the menu takes a second row.
// On phones the menu folds behind a "Menu" button.
// Sim (a menu link and a header button) opens the Sim page (#/sim), whose Launch button leaves the
// app for the separate 3D page in public/sim (ADR-015). The Junior/Planner switch is gone from the
// header; the app stays in Junior.

import React, { useEffect, useRef, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { hrefFor, NAV_ITEMS, NavGroupId, Route, RouteId, useRoute } from '../router.ts';
import { Icon } from './Icon.tsx';

const BrandMark: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
    <circle cx="22" cy="22" r="21" fill="var(--navy)" />
    <circle cx="29" cy="15" r="7" fill="#e7ebf5" />
    <circle cx="27" cy="13" r="2" fill="#c9d2e6" />
    <path
      d="M8 34c6-10 14-15 24-16"
      fill="none"
      stroke="var(--rocket)"
      strokeWidth="2.5"
      strokeDasharray="1 5"
      strokeLinecap="round"
    />
    <path d="M12 31c1-5 4-8 8-9l2 3c-1 4-4 7-9 8Z" fill="var(--sun)" />
  </svg>
);

/** The standalone 3D sim, served as-is from public/sim (works on a sub-path too). */
export const SIM_HREF = `${import.meta.env.BASE_URL}sim/index.html`;

/** One dropdown of the menu: a button that shows or hides its list of pages (disclosure pattern). */
const NavGroup: React.FC<{
  id: NavGroupId;
  pages: readonly RouteId[];
  current: RouteId;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ id, pages, current, isOpen, onToggle, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = `nav-group-${id}`;
  const hasCurrent = pages.includes(current);

  return (
    <li
      className={`nav-group${isOpen ? ' is-open' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isOpen) {
          e.stopPropagation();
          onClose();
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`nav-group-button${hasCurrent ? ' has-current' : ''}`}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={onToggle}
      >
        {copy.site.groups[id]} <Icon name="down" size={16} />
      </button>
      <ul id={listId} className="nav-dropdown" hidden={!isOpen}>
        {pages.map((page) => (
          <li key={page}>
            <a href={hrefFor(page)} aria-current={current === page ? 'page' : undefined}>
              {copy.site.pages[page]}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
};

export const Header: React.FC = () => {
  const route = useRoute();
  // The phone menu and the dropdowns remember which page they were opened on, so a new page
  // closes them.
  const [openOn, setOpenOn] = useState<Route | null>(null);
  const isMenuOpen = openOn === route;
  const [openGroup, setOpenGroup] = useState<{ id: NavGroupId; on: Route } | null>(null);
  const activeGroup = openGroup?.on === route ? openGroup.id : null;
  const navRef = useRef<HTMLElement>(null);

  // A click anywhere outside the menu closes an open dropdown.
  useEffect(() => {
    if (!activeGroup) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [activeGroup]);

  return (
    <header className="app-header">
      <div className="header-row">
        <a className="brand" href={hrefFor('home')} aria-label={copy.site.homeLink}>
          <BrandMark />
          <div>
            <h1 className="brand-name">{copy.header.title}</h1>
            <p className="brand-sub">{copy.header.subtitle}</p>
          </div>
        </a>
        <nav
          id="site-menu"
          ref={navRef}
          aria-label={copy.site.navLabel}
          className={`site-nav${isMenuOpen ? ' is-open' : ''}`}
        >
          <ul className="nav-top">
            {NAV_ITEMS.map((item) =>
              item.kind === 'link' ? (
                <li key={item.id}>
                  <a
                    href={hrefFor(item.id)}
                    aria-current={route.id === item.id ? 'page' : undefined}
                  >
                    {copy.site.pages[item.id]}
                  </a>
                </li>
              ) : (
                <NavGroup
                  key={item.id}
                  id={item.id}
                  pages={item.pages}
                  current={route.id}
                  isOpen={activeGroup === item.id}
                  onToggle={() =>
                    setOpenGroup(activeGroup === item.id ? null : { id: item.id, on: route })
                  }
                  onClose={() => setOpenGroup(null)}
                />
              ),
            )}
          </ul>
        </nav>
        <div className="header-tabs">
          {/* Quiz and Sim side by side, equal width; the real-data badge sits under them. */}
          <div className="header-cta">
            <a
              className="btn-link header-action header-quiz"
              href={hrefFor('quiz')}
              aria-current={route.id === 'quiz' ? 'page' : undefined}
            >
              <Icon name="bulb" size={18} /> {copy.quizCards.button}
            </a>
            <a
              className="btn-link header-action header-sim"
              href={hrefFor('sim')}
              aria-current={route.id === 'sim' ? 'page' : undefined}
            >
              <Icon name="rocket" size={18} /> {copy.site.sim}
            </a>
            <a className="real-data-badge hide-on-phone" href={hrefFor('data')}>
              <Icon name="sun" size={16} /> <span>{copy.header.realDataBadge}</span>
            </a>
          </div>
          <button
            type="button"
            className="menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            onClick={() => setOpenOn(isMenuOpen ? null : route)}
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} size={20} />{' '}
            {isMenuOpen ? copy.site.closeMenu : copy.site.menu}
          </button>
        </div>
      </div>
    </header>
  );
};
