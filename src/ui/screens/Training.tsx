// Training Bay (#/training).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { PageIntro } from '../components/PageIntro.tsx';

export const TrainingScreen: React.FC = () => (
  <div className="page">
    <PageIntro title={copy.site.pages.training} lead={copy.words.soon} />
  </div>
);
