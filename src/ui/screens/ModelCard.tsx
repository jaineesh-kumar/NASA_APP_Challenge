// Model Card Screen: Parameter Table, Sources, and Scientific Simplifications
// Spec B1, B8, B9, Part C (L8 AC3)

import React, { useMemo, useState } from 'react';
import { loadParams } from '../../engine/params.ts';
import { ParamEntry } from '../../engine/types.ts';
import { WhyThisNumber } from '../components/WhyThisNumber.tsx';

const paramsInstance = loadParams();
const allParamEntries = paramsInstance.allEntries();

const SIMPLIFICATIONS = [
  {
    topic: 'Discrete Hourly Time Ticks',
    detail:
      'The simulation advances in 1-hour discrete steps rather than continuous real-time differential equations. Power flows and crew hours are averaged across each 60-minute interval.',
  },
  {
    topic: 'Crew Homogeneity & Environmental Exposure',
    detail:
      'All 4 crew members consume identical standard NASA BVAD nutritional (2500 kcal/day) and metabolic (0.84 kg O2, 1.0 kg CO2) rates. Crew fatigue, psychology, and sleep schedules are excluded.',
  },
  {
    topic: 'Surface-Level Radiation vs. EVA Spacewalks',
    detail:
      'Radiation exposure models surface-level dose equivalent based on Chang’e-4 lunar measurements (S02) plus SPE spikes. Spacewalk-specific EVA dose accumulation is out of scope for v0.1.',
  },
  {
    topic: 'Habitat Thermal Regulation',
    detail:
      'Thermal loads are modeled as a baseline demand (4 kW) with a 1.5x power multiplier during dark windows to account for extreme lunar nighttime chilling without continuous solar radiant heating.',
  },
  {
    topic: 'Single-Site Geography',
    detail:
      'Dark window durations and lighting fractions are calibrated for Malapert Ridge and Shackleton Crater rim, simplifying complex topography-induced rolling horizons into scheduled windows with uniform jitter.',
  },
  {
    topic: 'No Runtime Telemetry or Backend',
    detail:
      'All calculations, Monte Carlo campaigns, and state persist strictly inside client-side browser memory with zero network trackers, servers, or external AI APIs (Spec A4 F10).',
  },
];

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
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          Scientific Model Card & Parameter Registry
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Full scientific transparency for Moonbase Margin v{paramsInstance.version}. Inspect all{' '}
          {allParamEntries.length} baseline parameters, source citations (S01–S11), confidence
          levels, and documented modeling simplifications.
        </p>
      </div>

      {/* Simplifications Section (AC3) */}
      <div className="panel-card" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          Documented Modeling Simplifications (Spec B1)
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
          To ensure accessible real-time browser performance for learners aged 10–16, the following
          deliberate engineering abstractions were implemented:
        </p>

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
