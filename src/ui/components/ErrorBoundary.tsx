// Error boundary for catastrophic runtime errors, invalid params, or worker failures
// Spec Part C (L9 AC3)

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected simulation error occurred.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          className="app-container"
          style={{ justifyContent: 'center', alignItems: 'center', padding: '48px 16px' }}
        >
          <div
            className="panel-card"
            role="alert"
            style={{
              maxWidth: '560px',
              width: '100%',
              borderLeft: '6px solid var(--color-danger)',
              padding: '32px 24px',
              backgroundColor: 'var(--color-bg-surface-elevated)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
            >
              <span style={{ fontSize: '1.75rem' }}>⚠️</span>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--color-danger)',
                }}
              >
                Simulation Recovery System
              </h2>
            </div>

            <p
              style={{
                color: 'var(--color-text-main)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              Moonbase Margin encountered an unexpected hardware parameter or scenario calculation
              error.
            </p>

            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.85rem',
                backgroundColor: 'var(--color-bg-base)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-danger)',
                marginBottom: '20px',
                wordBreak: 'break-all',
              }}
            >
              {this.state.errorMessage}
            </div>

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 600,
                padding: '10px 20px',
                border: 'none',
              }}
            >
              Reset Outpost to Nominal Baseline ↺
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
