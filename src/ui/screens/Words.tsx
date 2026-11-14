// Space Words: the glossary as its own page (#/words). Terms live in src/content/copy.ts.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { PageIntro } from '../components/PageIntro.tsx';

export const WordsScreen: React.FC = () => (
  <div className="page">
    <PageIntro title={copy.words.title} lead={copy.words.lead} />
    <dl className="word-list">
      {copy.glossary.terms.map((g) => (
        <div key={g.term} className="word-card">
          <dt>{g.term}</dt>
          <dd>{g.meaning}</dd>
        </div>
      ))}
    </dl>
  </div>
);
