/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { copy } from './content/copy.ts';
import { AppStoreProvider } from './state/store.tsx';
import { ErrorBoundary } from './ui/components/ErrorBoundary.tsx';
import { Header } from './ui/components/Header.tsx';
import { RouteId, useRoute } from './ui/router.ts';
import { DataScienceScreen } from './ui/screens/DataScience.tsx';
import { FreeBuildScreen } from './ui/screens/FreeBuild.tsx';
import { HowToPlayScreen } from './ui/screens/HowToPlay.tsx';
import { LandingScreen } from './ui/screens/Landing.tsx';
import { LogbookScreen } from './ui/screens/Logbook.tsx';
import { MissionsScreen } from './ui/screens/Missions.tsx';
import { TeachersScreen } from './ui/screens/Teachers.tsx';
import { TrainingScreen } from './ui/screens/Training.tsx';
import { WordsScreen } from './ui/screens/Words.tsx';

const PAGES: Record<RouteId, React.FC> = {
  home: LandingScreen,
  'how-to-play': HowToPlayScreen,
  missions: MissionsScreen,
  training: TrainingScreen,
  'free-build': FreeBuildScreen,
  logbook: LogbookScreen,
  words: WordsScreen,
  teachers: TeachersScreen,
  data: DataScienceScreen,
};

const AppContent: React.FC = () => {
  const route = useRoute();
  const Page = PAGES[route.id];
  const path = [route.id, ...route.sub].join('/');

  // Each new page starts at its top, with focus on the page for screen readers.
  const mainRef = useRef<HTMLElement>(null);
  const isFirstPage = useRef(true);
  useEffect(() => {
    document.title =
      route.id === 'home' ? copy.header.title : copy.site.docTitle(copy.site.pages[route.id]);
    if (isFirstPage.current) {
      isFirstPage.current = false;
      return;
    }
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [path, route.id]);

  return (
    <div className="app-container">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          // Keep the route hash: move focus instead of following the anchor.
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        {copy.site.skipLink}
      </a>
      <Header />
      <main className="main-content" id="main-content" ref={mainRef} tabIndex={-1}>
        <Page key={route.id} />
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
