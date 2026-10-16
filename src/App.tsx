/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppStoreProvider, useAppStore } from './state/store.tsx';
import { ErrorBoundary } from './ui/components/ErrorBoundary.tsx';
import { Header } from './ui/components/Header.tsx';
import { Nav } from './ui/components/Nav.tsx';
import { BriefingScreen } from './ui/screens/Briefing.tsx';
import { DesignScreen } from './ui/screens/Design.tsx';
import { LearnScreen } from './ui/screens/Learn.tsx';
import { ModelCardScreen } from './ui/screens/ModelCard.tsx';
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
        return <LearnScreen />;
      case 'model_card':
        return <ModelCardScreen />;
      default:
        return <BriefingScreen />;
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
    <ErrorBoundary>
      <AppStoreProvider>
        <AppContent />
      </AppStoreProvider>
    </ErrorBoundary>
  );
}
