// Header: brand (links home), Junior/Planner toggle, the real-data badge and the site menu.
// On phones the menu folds behind a "Menu" button; on wider screens it is always shown.

import React, { useState } from 'react';
import { copy } from '../../content/copy.ts';
import { hrefFor, Route, ROUTE_IDS, useRoute } from '../router.ts';
import { Icon } from './Icon.tsx';
import { ModeToggle } from './ModeToggle.tsx';

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

export const Header: React.FC = () => {
  const route = useRoute();
  // The phone menu remembers which page it was opened on, so a new page closes it.
  const [openOn, setOpenOn] = useState<Route | null>(null);
  const isMenuOpen = openOn === route;

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
        <div className="header-tabs">
          <ModeToggle />
          <a className="real-data-badge hide-on-phone" href={hrefFor('data')}>
            <Icon name="sun" size={16} /> <span>{copy.header.realDataBadge}</span>
          </a>
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
      <nav
        id="site-menu"
        aria-label={copy.site.navLabel}
        className={`site-nav${isMenuOpen ? ' is-open' : ''}`}
      >
        <ul>
          {ROUTE_IDS.map((id) => (
            <li key={id}>
              <a href={hrefFor(id)} aria-current={route.id === id ? 'page' : undefined}>
                {copy.site.pages[id]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
