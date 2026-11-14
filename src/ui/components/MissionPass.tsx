// Review's boarding pass: the one big number, labelled pass fields, and the rating stamp on the
// tear-off stub. Replaces the old stat-card row.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getSimConstants } from '../../engine/constants.ts';
import { loadParams } from '../../engine/params.ts';
import { CampaignResult, FailureCause } from '../../engine/types.ts';
import { Icon } from './Icon.tsx';
import { stormModeName } from './StormPicker.tsx';
import { WhyThisNumber } from './WhyThisNumber.tsx';

const params = loadParams();
const k = getSimConstants(params);
const budget = params.getNumber('mass.budget');
const CAUSES: readonly FailureCause[] = ['oxygen', 'co2', 'water', 'food', 'dose'];
const per100 = (rate: number) => Math.round(rate * 100);
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function mainTrouble(c: CampaignResult): string {
  let top: FailureCause | null = null;
  for (const cause of CAUSES) {
    if (c.causeCounts[cause] > 0 && (top === null || c.causeCounts[cause] > c.causeCounts[top]))
      top = cause;
  }
  return top ? copy.causes[top] : copy.pass.noTrouble;
}

export const MissionPass: React.FC<{ result: CampaignResult; showRanges: boolean }> = ({
  result: c,
  showRanges,
}) => {
  const p = copy.pass;
  const isReady = c.rating === 'flight_ready';
  const t = copy.review;
  return (
    <section className="pass" aria-label={p.label}>
      <div className="pass-main">
        <p className="pass-hero">
          <span className="pass-number">{p.crewsHome(per100(c.survivalRate))}</span>
          <span className="pass-hero-text">{p.crewsHomeText}</span>
        </p>
        {showRanges ? (
          <p className="small muted">
            {p.range}: {pct(c.survivalCi.low)} to {pct(c.survivalCi.high)}. {t.confidenceHelp}
          </p>
        ) : null}
        <dl className="pass-fields">
          <div>
            <dt>
              {p.science}
              <WhyThisNumber paramId="science.target_hours" />
            </dt>
            <dd>{p.of100(per100(c.successRate))}</dd>
          </div>
          <div>
            <dt>
              {p.weight}
              <WhyThisNumber paramId="mass.budget" />
            </dt>
            <dd>{t.massOf(c.massUsed, budget)}</dd>
          </div>
          <div>
            <dt>{p.storms}</dt>
            <dd>{stormModeName(c.stormMode)}</dd>
          </div>
          <div>
            <dt>{p.trouble}</dt>
            <dd>{mainTrouble(c)}</dd>
          </div>
        </dl>
      </div>
      <div className="pass-stub">
        <p className={isReady ? 'rating-stamp is-ready' : 'rating-stamp'} role="status">
          <Icon name={isReady ? 'rocket' : 'warning'} size={24} />{' '}
          {isReady ? t.flightReadyTitle : t.needsWorkTitle}
        </p>
        <p className="small">
          {isReady
            ? t.flightReadyDesc(
                Math.round(k.flightReadySurvival * 100),
                Math.round(k.flightReadySuccess * 100),
              )
            : t.needsWorkDesc(
                Math.round(k.flightReadySurvival * 100),
                Math.round(k.flightReadySuccess * 100),
              )}
          <WhyThisNumber paramId="rating.flight_ready_survival" />
        </p>
      </div>
    </section>
  );
};
