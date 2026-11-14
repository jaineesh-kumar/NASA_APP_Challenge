// A science word with its kid-friendly meaning one tap away (B9, L11 AC8). Uses a native
// disclosure so it works with keyboard, touch and screen readers; nothing is hover-only.

import React from 'react';
import { copy } from '../../content/copy.ts';

export const Term: React.FC<{ term: string }> = ({ term }) => {
  const entry = copy.glossary.terms.find((t) => t.term === term);
  if (!entry) return null;
  return (
    <details className="term">
      <summary>{entry.term}</summary>
      <p className="small">{entry.meaning}</p>
    </details>
  );
};
