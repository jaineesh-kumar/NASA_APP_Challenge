// Model Card Screen: Parameter Table, Sources, and Scientific Simplifications
// Spec B1, B8, B9, Part C (L8 AC3)

import React, { useMemo, useState } from 'react';
import { copy } from '../../content/copy.ts';
import { loadParams } from '../../engine/params.ts';
import { getSpaceWeather } from '../../engine/spaceWeather.ts';
import { ParamEntry } from '../../engine/types.ts';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const paramsInstance = loadParams();
const allParamEntries = paramsInstance.allEntries();

const SIMPLIFICATIONS = copy.modelCard.simplifications;
const sw = getSpaceWeather();
const mc = copy.modelCard;

export const ModelCardScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredEntries = useMemo(() => {
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

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <h2 className="screen-title">{mc.heading}</h2>
      <p className="muted" style={{ marginBottom: 24 }}>
        {mc.intro(paramsInstance.version, allParamEntries.length)}
      </p>

      <section className="panel-card" aria-labelledby="data-title">
        <h3 id="data-title" className="card-title">
          ☀ {mc.dataTitle}
        </h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          {mc.dataIntro}
        </p>
        <dl className="tiles">
          {mc.dataRows.map((row) => (
            <div key={row.name} className="tile">
              <dt style={{ fontWeight: 700 }}>{row.name}</dt>
              <dd className="small">{row.use}</dd>
            </div>
          ))}
        </dl>
        <p className="small" style={{ marginTop: 12 }}>
          {mc.stormStats(
            sw.storms.length,
            sw.rawEntries,
            sw.coverageStart,
            sw.coverageEnd,
            sw.fetchedAt,
          )}
        </p>
      </section>

      <section className="panel-card" aria-labelledby="comms-title">
        <h3 id="comms-title" className="card-title">
          📡 {mc.commsTitle}
          <WhyThisNumber paramId="comms.earth_moon_light_delay_s" />
        </h3>
        <p className="small">
          {mc.commsBody(
            paramsInstance.getNumber('comms.earth_moon_light_delay_s'),
            paramsInstance.getNumberArray('comms.earth_mars_light_delay_min'),
          )}
        </p>
      </section>

      <div className="panel-card" style={{ marginBottom: '28px' }}>
        <h3 className="card-title">{mc.simplificationsTitle}</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '14px',
          }}
        >
          {SIMPLIFICATIONS.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--color-bg-base)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--color-primary)',
                  marginBottom: '4px',
                }}
              >
                {item.topic}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parameters Table Section */}
      <div className="panel-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Complete Parameter Registry ({filteredEntries.length} of {allParamEntries.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Values sourced from NASA BVAD (S01), Chang’e-4 (S02), and Space Engineering References
            </span>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameters or notes..."
              aria-label="Filter parameters by text"
              style={{ minWidth: '200px', fontSize: '0.85rem' }}
            />

            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              aria-label="Filter by confidence level"
              style={{ fontSize: '0.85rem' }}
            >
              <option value="all">All Confidences</option>
              <option value="high">High Confidence</option>
              <option value="medium">Medium Confidence</option>
              <option value="low">Low Confidence (Illustrative)</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              aria-label="Filter by source ID"
              style={{ fontSize: '0.85rem' }}
            >
              <option value="all">All Sources</option>
              <option value="S01">S01 (NASA BVAD)</option>
              <option value="S02">S02 (Lunar Surface Dose)</option>
              <option value="S03">S03 (Peaks of Eternal Light)</option>
              <option value="S04">S04 (ECLSS Fact Sheet)</option>
              <option value="S05">S05 (Sabatier Reactor)</option>
              <option value="S06">S06 (NASA PRA Guide)</option>
              <option value="S08">S08 (ISS ECLSS)</option>
              <option value="S09">S09 (Peaks Illumination)</option>
              <option value="S10">S10 (ECLSS Sizing)</option>
              <option value="DERIVED">DERIVED (Physics/Chem)</option>
              <option value="ASSUMPTION">ASSUMPTION (Game Balance)</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '10px 8px' }}>Param ID</th>
                <th style={{ padding: '10px 8px' }}>Baseline Value</th>
                <th style={{ padding: '10px 8px' }}>Source</th>
                <th style={{ padding: '10px 8px' }}>Confidence</th>
                <th style={{ padding: '10px 8px' }}>Scientific Context & Notes</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(([id, entry]: [string, ParamEntry]) => {
                const isIllustrative = entry.source === 'ASSUMPTION' || entry.confidence === 'low';
                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 8px',
                        fontFamily: 'var(--font-family-mono)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {id}
                    </td>

                    <td style={{ padding: '10px 8px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {Array.isArray(entry.value) ? `[${entry.value.join(', ')}]` : entry.value}{' '}
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {entry.unit}
                      </span>
                    </td>

                    <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {entry.source}
                      </span>
                    </td>

                    <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          backgroundColor:
                            entry.confidence === 'high'
                              ? 'var(--color-success-bg)'
                              : 'var(--color-warning-bg)',
                          color:
                            entry.confidence === 'high'
                              ? 'var(--color-success)'
                              : 'var(--color-warning)',
                        }}
                      >
                        {entry.confidence}
                      </span>
                      {isIllustrative && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          Illustrative (Spec B9)
                        </div>
                      )}
                    </td>

                    <td
                      style={{
                        padding: '10px 8px',
                        lineHeight: 1.4,
                        color: 'var(--color-text-main)',
                      }}
                    >
                      {entry.note}
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <WhyThisNumber paramId={id} label="?" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
