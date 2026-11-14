// Header: brand, the two pages outside the step flow, and the real-data badge

import React from 'react';
import { copy } from '../../content/copy.ts';
import { useAppStore } from '../../state/store.tsx';
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
  const { state, dispatch } = useAppStore();
  const tab = (screen: 'learn' | 'model_card', label: string, icon: 'book' | 'bulb') => (
    <button
      type="button"
      className="header-tab"
      aria-label={label}
      aria-current={state.currentScreen === screen ? 'page' : undefined}
      onClick={() => dispatch({ type: 'SET_SCREEN', screen })}
    >
      <Icon name={icon} size={20} /> <span>{label}</span>
    </button>
  );

  return (
    <header className="app-header">
      <div className="brand">
        <BrandMark />
        <div>
          <h1 className="brand-name">{copy.header.title}</h1>
          <p className="brand-sub">{copy.header.subtitle}</p>
        </div>
      </div>
      <div className="header-tabs">
        <ModeToggle />
        {tab('learn', copy.nav.learn, 'book')}
        {tab('model_card', copy.nav.modelCard, 'bulb')}
        <span className="real-data-badge hide-on-phone">
          <Icon name="sun" size={16} label={copy.header.realDataBadge} />{' '}
          <span className="hide-sm" aria-hidden="true">
            {copy.header.realDataBadge}
          </span>
        </span>
      </div>
    </header>
  );
};
