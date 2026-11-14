// Logbook (#/logbook).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { PageIntro } from '../components/PageIntro.tsx';

export const LogbookScreen: React.FC = () => (
  <div className="page">
    <PageIntro title={copy.site.pages.logbook} lead={copy.words.soon} />
  </div>
);
