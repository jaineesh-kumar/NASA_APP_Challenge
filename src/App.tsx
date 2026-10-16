/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppStoreProvider, useAppStore } from './state/store.tsx';
import { Header } from './ui/components/Header.tsx';
import { Nav } from './ui/components/Nav.tsx';
import { BriefingScreen } from './ui/screens/Briefing.tsx';
import { DesignScreen } from './ui/screens/Design.tsx';
import { RehearseScreen } from './ui/screens/Rehearse.tsx';
import { ReviewScreen } from './ui/screens/Review.tsx';
import { RulesScreen } from './ui/screens/Rules.tsx';

const AppContent: React.FC = () => {
  const { state } = useAppStore();

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'briefing':
        return <BriefingScreen />;
      case 'design':
        return <DesignScreen />;
      case 'rules':
        return <RulesScreen />;
      case 'rehearse':
        return <RehearseScreen />;
      case 'review':
        return <ReviewScreen />;
      case 'learn':
      case 'model_card':
      default:
        return (
          <div className="panel-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
              {state.currentScreen.toUpperCase()} Screen
            </h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Configured and unlocked in upcoming mission stages.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Nav />
      <main className="main-content" id="main-content">
        {renderScreen()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}
