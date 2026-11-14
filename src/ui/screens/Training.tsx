// Training Bay (#/training): practice games. Each game has its own page:
// #/training/power-juggle and #/training/storm-shelter.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { TrainingId, useProgress } from '../../state/progress.ts';
import { Icon, IconName } from '../components/Icon.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { hrefFor, useRoute } from '../router.ts';
import { PowerJuggleGame } from '../training/PowerJuggleGame.tsx';
import { StormShelterGame } from '../training/StormShelterGame.tsx';

interface GameEntry {
  slug: string;
  id: TrainingId;
  name: string;
  short: string;
  icon: IconName;
  Game: React.FC;
}

const GAMES: readonly GameEntry[] = [
  {
    slug: 'power-juggle',
    id: 'power_juggle',
    name: copy.training.juggle.name,
    short: copy.training.juggle.short,
    icon: 'bolt',
    Game: PowerJuggleGame,
  },
  {
    slug: 'storm-shelter',
    id: 'storm_shelter',
    name: copy.training.shelter.name,
    short: copy.training.shelter.short,
    icon: 'shield',
    Game: StormShelterGame,
  },
];

export const TrainingScreen: React.FC = () => {
  const route = useRoute();
  const progress = useProgress();
  const t = copy.training;
  const open = GAMES.find((g) => g.slug === route.sub[0]);

  if (open) {
    return (
      <div className="page">
        <a className="btn-link" href={hrefFor('training')}>
          <Icon name="back" size={18} /> {t.back}
        </a>
        <PageIntro kicker={t.title} title={open.name} />
        <open.Game />
      </div>
    );
  }

  return (
    <div className="page">
      <PageIntro title={t.title} lead={t.lead} />
      <ul className="tile-links" aria-label={t.gamesLabel}>
        {GAMES.map((g) => {
          const p = progress.training[g.id];
          return (
            <li key={g.slug}>
              <a href={hrefFor('training', g.slug)}>
                <Icon name={g.icon} size={26} />
                <span className="tile-link-title">{g.name}</span>
                <span className="tile-link-body">{g.short}</span>
                <span className="tile-link-meta">
                  {p ? t.best(p.bestScore) : t.notPlayed}
                  {p?.hasCleared ? ` · ${t.cleared}` : ''}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
