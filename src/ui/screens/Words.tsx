// Space Words (#/words): every glossary term, A to Z. Terms live in src/content/copy.ts, and the
// same entries open in place wherever a science word appears in the game (Term component).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { media, wordMedia } from '../../content/media.ts';
import { mediaUrl } from '../components/MediaCard.tsx';
import { PageIntro } from '../components/PageIntro.tsx';

const terms = [...copy.glossary.terms].sort((a, b) => a.term.localeCompare(b.term));

export const WordsScreen: React.FC = () => (
  <div className="page">
    <PageIntro title={copy.words.title} lead={copy.words.lead} />
    <p className="muted small">{copy.words.count(terms.length)}</p>
    <dl className="word-list">
      {terms.map((g) => {
        const icon = wordMedia[g.term];
        return (
          <div key={g.term} className="word-card">
            <dt>
              {icon ? (
                <img
                  className="word-icon"
                  src={mediaUrl(media[icon])}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                />
              ) : null}
              {g.term}
            </dt>
            <dd>{g.meaning}</dd>
          </div>
        );
      })}
    </dl>
  </div>
);
