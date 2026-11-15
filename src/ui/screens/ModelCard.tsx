// Model Card Screen: Parameter Table, Sources, and Scientific Simplifications
// Spec B1, B8, B9, Part C (L8 AC3)

import React, { useMemo, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { getDonkiArchive } from '../../engine/params.ts';
import { ParamEntry } from '../../engine/types.ts';
import { DataPanel } from '../components/DataPanel.tsx';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';
import { Icon, IconName } from '../components/Icon.tsx';

const paramsInstance = loadParams();
const allParamEntries = paramsInstance.allEntries();

const SIMPLIFICATIONS = copy.modelCard.simplifications;
const archive = getDonkiArchive();
const mc = copy.modelCard;

/** One symbol per "What we simplified" card, in the order of copy.modelCard.simplifications. */
const SIMPLIFICATION_ICONS: readonly IconName[] = [
  'clock',
  'helmet',
  'flare',
  'rocket',
  'sun',
  'flag',
  'antenna',
  'lock',
];

/** Cards per page. A layout choice, not a domain number. */
const PAGE_SIZE = 12;

type SectionId = keyof typeof copy.modelCard.sections;
const SECTION_IDS: readonly SectionId[] = [
  'all',
  'mission',
  'crew',
  'air',
  'food',
  'power',
  'sites',
  'radiation',
  'repairs',
  'mass',
  'radio',
  'other',
];

/** Which section a param belongs to, from the first part of its id (e.g. "crew.size"). */
const SECTION_BY_PREFIX: Readonly<Record<string, SectionId>> = {
  mission: 'mission',
  missions: 'mission',
  campaign: 'mission',
  science: 'mission',
  rating: 'mission',
  crew: 'crew',
  start: 'crew',
  construction: 'crew',
  water: 'air',
  o2: 'air',
  co2: 'air',
  loss: 'air',
  greenhouse: 'food',
  power: 'power',
  load: 'power',
  site: 'sites',
  radiation: 'radiation',
  failure: 'repairs',
  repair: 'repairs',
  mass: 'mass',
  comms: 'radio',
};

function sectionOf(id: string): SectionId {
  return SECTION_BY_PREFIX[id.split('.')[0] ?? ''] ?? 'other';
}

/** Source ids that at least one param uses, in a stable order. */
const SOURCES_IN_USE = [...new Set(allParamEntries.map(([, e]) => e.source))].sort();

export const ModelCardScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [section, setSection] = useState<SectionId>('all');
  const [page, setPage] = useState(1);

  /** Any change to the filters starts again on page 1. */
  const resetTo = (change: () => void) => {
    change();
    setPage(1);
  };

  const matchesFilters = useMemo(() => {
    return allParamEntries.filter(([id, entry]: [string, ParamEntry]) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = id.toLowerCase().includes(query);
        const matchesNote = entry.note.toLowerCase().includes(query);
        const matchesSource = entry.source.toLowerCase().includes(query);
        if (!matchesId && !matchesNote && !matchesSource) {
          return false;
        }
      }

      // Confidence
      if (selectedConfidence !== 'all' && entry.confidence !== selectedConfidence) {
        return false;
      }

      // Source
      if (selectedSource !== 'all' && entry.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedConfidence, selectedSource]);

  // Section counts follow the search and dropdowns, so each chip says how many cards it opens.
  const sectionCounts = useMemo(() => {
    const counts = Object.fromEntries(SECTION_IDS.map((s) => [s, 0])) as Record<SectionId, number>;
    for (const [id] of matchesFilters) {
      counts[sectionOf(id)] += 1;
      counts.all += 1;
    }
    return counts;
  }, [matchesFilters]);

  const filteredEntries =
    section === 'all' ? matchesFilters : matchesFilters.filter(([id]) => sectionOf(id) === section);

  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageEntries = filteredEntries.slice(start, start + PAGE_SIZE);

  return (
    <div className="model-card">
      <div className="model-card-intro">
        <h2 className="screen-title">{mc.heading}</h2>
        <p className="page-lead">{mc.intro(paramsInstance.version, allParamEntries.length)}</p>
      </div>

      <DataPanel />
      <p className="data-block-note data-block-note--loose">
        <Icon name="flare" size={18} /> {mc.stormStats(archive.events.length, archive.retrievedAt)}
      </p>

      <section className="panel-card data-block data-block--radio" aria-labelledby="comms-title">
        <div className="data-block-head">
          <span className="data-block-icon" aria-hidden="true">
            <Icon name="antenna" size={26} />
          </span>
          <div>
            <h3 id="comms-title" className="card-title">
              {mc.commsTitle}
              <WhyThisNumber paramId="comms.moon_one_way_delay_s" />
            </h3>
            <p className="data-block-lead">
              {mc.commsBody(
                paramsInstance.getNumber('comms.moon_one_way_delay_s'),
                paramsInstance.getNumberArray('comms.earth_mars_light_delay_min'),
              )}
            </p>
          </div>
        </div>
      </section>

      <section
        className="panel-card data-block data-block--simple"
        aria-labelledby="simplified-title"
      >
        <div className="data-block-head">
          <span className="data-block-icon" aria-hidden="true">
            <Icon name="bulb" size={26} />
          </span>
          <div>
            <h3 id="simplified-title" className="card-title">
              {mc.simplificationsTitle}
            </h3>
          </div>
        </div>
        <ul className="flash-grid">
          {SIMPLIFICATIONS.map((item, idx) => (
            <li key={item.topic} className="flash-card simple-card">
              <div className="flash-card-top">
                <span className="flash-icon" aria-hidden="true">
                  <Icon name={SIMPLIFICATION_ICONS[idx] ?? 'bulb'} size={22} />
                </span>
                <h4 className="flash-title">{item.topic}</h4>
              </div>
              <p className="flash-text">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Every number: section tabs, filters, a page of small cards, then the page buttons. */}
      <section
        className="panel-card data-block data-block--numbers params-browser"
        aria-labelledby="params-title"
      >
        <div className="data-block-head">
          <span className="data-block-icon" aria-hidden="true">
            <Icon name="database" size={26} />
          </span>
          <div>
            <h3 id="params-title" className="card-title">
              {mc.tableHeading(filteredEntries.length, allParamEntries.length)}
            </h3>
            <p className="data-block-lead">{mc.tableIntro}</p>
          </div>
        </div>

        <div className="params-sections" role="group" aria-label={mc.sectionsLabel}>
          {SECTION_IDS.filter(
            (sid) => sid === 'all' || sid === section || sectionCounts[sid] > 0,
          ).map((sid) => (
            <button
              key={sid}
              type="button"
              className={`params-section-chip section-${sid}`}
              aria-pressed={section === sid}
              onClick={() => resetTo(() => setSection(sid))}
            >
              {mc.sections[sid]} <span className="params-chip-count">{sectionCounts[sid]}</span>
            </button>
          ))}
        </div>

        <div className="params-filters">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => resetTo(() => setSearchQuery(e.target.value))}
            placeholder={mc.searchPlaceholder}
            aria-label={mc.searchLabel}
          />
          <select
            value={selectedConfidence}
            onChange={(e) => resetTo(() => setSelectedConfidence(e.target.value))}
            aria-label={mc.confidenceLabel}
          >
            <option value="all">{mc.allConfidences}</option>
            <option value="high">{mc.confidenceOptions.high}</option>
            <option value="medium">{mc.confidenceOptions.medium}</option>
            <option value="low">{mc.confidenceOptions.low}</option>
          </select>
          <select
            value={selectedSource}
            onChange={(e) => resetTo(() => setSelectedSource(e.target.value))}
            aria-label={mc.sourceLabel}
          >
            <option value="all">{mc.allSources}</option>
            {SOURCES_IN_USE.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {pageEntries.length === 0 ? (
          <p className="params-empty">{mc.noMatches}</p>
        ) : (
          <ul className="params-grid">
            {pageEntries.map(([id, entry]) => {
              const sid = sectionOf(id);
              const isIllustrative = entry.source === 'ASSUMPTION' || entry.confidence === 'low';
              return (
                <li key={id} className={`param-card section-${sid}`}>
                  <div className="param-card-top">
                    <span className="param-section-tag">{mc.sections[sid]}</span>
                    <span className={`param-sure sure-${entry.confidence}`}>
                      {mc.sureLabel(entry.confidence)}
                    </span>
                  </div>
                  <p className="param-value">
                    {Array.isArray(entry.value) ? entry.value.join(', ') : entry.value}
                    <span className="param-unit"> {entry.unit}</span>
                  </p>
                  <p className="param-id">{id}</p>
                  <p className="param-note">{entry.note}</p>
                  <div className="param-card-foot">
                    <span className="param-source">{mc.sourceChip(entry.source)}</span>
                    {isIllustrative ? (
                      <span className="param-illustrative">{mc.illustrative}</span>
                    ) : null}
                    <span className="param-why">
                      <WhyThisNumber paramId={id} label={mc.whyButton} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="params-pager">
          <p className="params-showing" aria-live="polite">
            {mc.showing(
              filteredEntries.length === 0 ? 0 : start + 1,
              start + pageEntries.length,
              filteredEntries.length,
            )}
          </p>
          {pageCount > 1 ? (
            <nav aria-label={mc.pageLabel}>
              <ul className="params-pages">
                <li>
                  <button
                    type="button"
                    className="params-page-btn"
                    disabled={safePage === 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    {mc.prevPage}
                  </button>
                </li>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      className="params-page-btn"
                      aria-label={mc.goToPage(n)}
                      aria-current={n === safePage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="params-page-btn"
                    disabled={safePage === pageCount}
                    onClick={() => setPage(safePage + 1)}
                  >
                    {mc.nextPage}
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
};
