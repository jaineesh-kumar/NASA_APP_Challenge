// Landing page (#/).

import React from 'react';
import { copy } from '../../content/copy.ts';
import { PageIntro } from '../components/PageIntro.tsx';
import { hrefFor } from '../router.ts';

export const LandingScreen: React.FC = () => (
  <div className="page">
    <PageIntro title={copy.header.title} lead={copy.briefing.summary} />
    <a className="btn-link btn-primary" href={hrefFor('how-to-play')}>
      {copy.landing.play}
    </a>
  </div>
);
