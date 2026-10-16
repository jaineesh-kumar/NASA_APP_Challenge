// Why this number? Inspector component
// Spec B8, B9, Part C (L7 AC6)

import React, { useState } from 'react';
import { loadParams } from '../../engine/params.ts';
import { ParamEntry } from '../../engine/types.ts';

interface WhyThisNumberProps {
  paramId: string;
  label?: string;
}

const params = loadParams();

export const WhyThisNumber: React.FC<WhyThisNumberProps> = ({ paramId, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  let entry: ParamEntry | null = null;
  try {
    entry = params.get(paramId);
  } catch {
    entry = null;
  }

  if (!entry) {
    return null;
  }

  const isIllustrative = entry.source === 'ASSUMPTION' || entry.confidence === 'low';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Why this number for ${paramId}`}
        aria-haspopup="dialog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          padding: 0,
          marginLeft: '6px',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-primary)',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-primary)',
          borderRadius: '50%',
          cursor: 'pointer',
          verticalAlign: 'middle',
          lineHeight: 1,
        }}
        title="Why this number? Click to inspect source & methodology"
      >
        {label || '?'}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`why-title-${paramId}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="panel-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--color-bg-surface-elevated)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border)',
              margin: 0,
              padding: '24px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '12px',
              }}
            >
              <h4
                id={`why-title-${paramId}`}
                style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}
              >
                Scientific Provenance
              </h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Parameter Key:
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginTop: '2px',
                }}
              >
                {paramId}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Baseline Value:
                </span>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {Array.isArray(entry.value) ? entry.value.join(', ') : entry.value}{' '}
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {entry.unit}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Source ID:
                </span>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                  {entry.source}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Confidence & Status:
              </span>
              <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor:
                      entry.confidence === 'high'
                        ? 'var(--color-success-bg)'
                        : 'var(--color-warning-bg)',
                    color:
                      entry.confidence === 'high' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {entry.confidence} confidence
                </span>
                {isIllustrative && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Illustrative (Spec B9)
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Scientific & Design Notes:
              </span>
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  marginTop: '4px',
                  backgroundColor: 'var(--color-bg-base)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {entry.note}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '8px 18px',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
