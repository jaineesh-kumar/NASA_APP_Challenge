// Data and science (#/data): the archived DONKI storms, what is real and what we simplified, the
// OSDR finding cards, then the full Model Card (every number, its source and confidence, and the
// Data panel). Everything shown here is an archived copy; nothing is fetched (F10).
// Each section has its own colour and symbol; information is shown as flash cards
// (symbol, heading, brief). The jump buttons scroll instead of using #anchors, because the
// router owns the URL hash.

import React from 'react';
import { copy } from '../../content/copy.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { DonkiEvent } from '../../engine/types.ts';
import { useAppStore } from '../../state/store.tsx';
import { Icon, IconName } from '../components/Icon.tsx';
import { OsdrCards } from '../components/OsdrCards.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { stormDate } from '../components/StormPicker.tsx';
import { navigate } from '../router.ts';
import { ModelCardScreen } from './ModelCard.tsx';

const archive = getDonkiArchive();

type JumpId = keyof typeof copy.dataPage.jump;
const JUMPS: readonly { id: JumpId; target: string; icon: IconName }[] = [
  { id: 'storms', target: 'data-storms', icon: 'flare' },
  { id: 'honesty', target: 'data-honesty', icon: 'check' },
  { id: 'findings', target: 'data-findings', icon: 'dna' },
  { id: 'numbers', target: 'data-numbers', icon: 'database' },
];

const HONESTY_ICON: Readonly<Record<string, IconName>> = {
  real: 'check',
  simplified: 'bulb',
  offline: 'lock',
};

/** C, M or X: the letter of the flare class decides the storm size in the game. */
const flareLetter = (flareClass: string) => flareClass.charAt(0).toUpperCase();

export const DataScienceScreen: React.FC = () => {
  const d = copy.dataPage;
  const { dispatch } = useAppStore();

  // Real Storm Replay from here: the player's own base (no mission) on the Test step.
  const replay = (e: DonkiEvent) => {
    dispatch({ type: 'END_MISSION' });
    dispatch({ type: 'SET_STORM_MODE', stormMode: { kind: 'replay', eventId: e.id } });
    dispatch({ type: 'SET_SCREEN', screen: 'rehearse' });
    navigate('free-build');
  };

  const jumpTo = (target: string) => {
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  return (
    <div className="page data-page">
      <PageIntro title={d.title} lead={d.lead} />

      <nav className="data-jump" aria-label={d.jumpLabel}>
        {JUMPS.map((j) => (
          <button
            key={j.id}
            type="button"
            className={`data-jump-btn jump-${j.id}`}
            onClick={() => jumpTo(j.target)}
          >
            <Icon name={j.icon} size={18} /> {d.jump[j.id]}
          </button>
        ))}
      </nav>

      <section
        id="data-storms"
        tabIndex={-1}
        className="panel-card data-block data-block--storms"
        aria-labelledby="storm-archive-title"
      >
        <div className="data-block-head">
          <span className="data-block-icon" aria-hidden="true">
            <Icon name="flare" size={26} />
          </span>
          <div>
            <h3 id="storm-archive-title" className="card-title">
              {d.stormsTitle}
            </h3>
            <p className="data-block-lead">{d.stormsIntro}</p>
          </div>
        </div>
        <ul className="flash-grid storm-archive">
          {archive.events.map((e) => {
            const letter = flareLetter(e.flareClass);
            const date = stormDate(e);
            return (
              <li key={e.id} className={`flash-card storm-flash flare-${letter}`}>
                <div className="flash-card-top">
                  <span className="flare-badge" aria-hidden="true">
                    {e.flareClass}
                  </span>
                  <div>
                    <p className="finding-label">{d.flareLabel}</p>
                    <h4 className="flash-title">{date}</h4>
                  </div>
                </div>
                <p className="flash-text">{d.stormFlare(e.flareClass)}</p>
                <p className="storm-strength">
                  <Icon name="flare" size={16} /> {d.stormStrength[letter] ?? ''}
                </p>
                <div className="flash-card-foot storm-actions">
                  <button
                    type="button"
                    className="btn-primary storm-replay"
                    aria-label={d.replayButton(date)}
                    onClick={() => replay(e)}
                  >
                    <Icon name="play" size={16} /> {d.replayShort}
                  </button>
                  <a className="flash-link" href={e.link} target="_blank" rel="noopener noreferrer">
                    {copy.storms.donkiLink} <Icon name="external" size={14} />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="data-block-note" role="note">
          <Icon name="archive" size={18} />
          <div>
            <p className="archived-label">{copy.storms.archivedLabel(archive.retrievedAt)}</p>
            <p>{copy.storms.honesty}</p>
          </div>
        </div>
      </section>

      <section
        id="data-honesty"
        tabIndex={-1}
        className="panel-card data-block data-block--honesty"
        aria-labelledby="honesty-title"
      >
        <div className="data-block-head">
          <span className="data-block-icon" aria-hidden="true">
            <Icon name="check" size={26} />
          </span>
          <div>
            <h3 id="honesty-title" className="card-title">
              {d.honestyTitle}
            </h3>
            <p className="data-block-lead">{d.honestyLead}</p>
          </div>
        </div>
        <ul className="flash-grid">
          {d.honesty.map((item) => (
            <li key={item.title} className={`flash-card honesty-card kind-${item.kind}`}>
              <div className="flash-card-top">
                <span className="flash-icon" aria-hidden="true">
                  <Icon name={HONESTY_ICON[item.kind] ?? 'check'} size={22} />
                </span>
                <div>
                  <p className="kind-tag">{d.honestyKinds[item.kind]}</p>
                  <h4 className="flash-title">{item.title}</h4>
                </div>
              </div>
              <p className="flash-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div id="data-findings" tabIndex={-1} className="page-section">
        <OsdrCards />
      </div>

      <div id="data-numbers" tabIndex={-1} className="page-section">
        <ModelCardScreen />
      </div>
    </div>
  );
};
