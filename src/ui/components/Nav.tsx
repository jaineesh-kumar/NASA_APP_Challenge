// Accessible navigation tab bar
// Spec B4.9, B4.10

import React from 'react';
import { copy } from '../../content/copy.ts';
import { ScreenId, useAppStore } from '../../state/store.tsx';

interface NavItem {
  id: ScreenId;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'briefing', label: copy.nav.briefing },
  { id: 'design', label: copy.nav.design },
  { id: 'rules', label: copy.nav.rules },
  { id: 'rehearse', label: copy.nav.rehearse },
  { id: 'review', label: copy.nav.review },
  { id: 'learn', label: copy.nav.learn },
  { id: 'model_card', label: copy.nav.modelCard },
];

export const Nav: React.FC = () => {
  const { state, dispatch } = useAppStore();

  return (
    <nav aria-label="Main Navigation" style={{ marginBottom: '24px' }}>
      <ul
        style={{
          display: 'flex',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
        }}
      >
        {navItems.map((item) => {
          const isActive = state.currentScreen === item.id;
          // In L6, cannot navigate past design if over budget (AC3)
          const isOverBudget = !state.isWithinBudget;
          const isBlocked =
            isOverBudget && (item.id === 'rules' || item.id === 'rehearse' || item.id === 'review');

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: item.id })}
                disabled={isBlocked}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-surface-elevated)',
                  color: isActive ? '#ffffff' : 'var(--color-text-main)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  padding: '6px 14px',
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
