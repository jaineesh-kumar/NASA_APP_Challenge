import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { copy } from '../../src/content/copy.ts';
import { CampaignResult, MissionResult } from '../../src/engine/types.ts';
import { AppStoreProvider, useAppStore } from '../../src/state/store.tsx';
import { ReviewScreen } from '../../src/ui/screens/Review.tsx';

describe('ReviewScreen Component (Spec Part C L7 AC2, AC3, AC5, AC6, AC8)', () => {
  const mockCampaign: CampaignResult = {
    runs: 300,
    survivalRate: 0.96,
    successRate: 0.85,
    survivalCi: { low: 0.932, high: 0.978 },
    successCi: { low: 0.805, high: 0.887 },
    minBatteryPctP5: 22.5,
    minO2DaysP5: 12.0,
    doseUsvP95: 32000,
    causeCounts: {
      oxygen: 4,
      co2: 2,
      water: 3,
      food: 1,
      dose: 2,
      science_missed: 15,
    },
    massUsed: 102,
    worstSeed: 42,
    rating: 'flight_ready',
  };

  const mockWorstMission: MissionResult = {
    seed: 42,
    survived: false,
    failureCause: 'oxygen',
    failureHour: 229,
    scienceMet: false,
    minBatteryPct: 0,
    minO2Days: 0,
    peakDoseUsv: 25000,
    log: [
      { t: 100, type: 'dark_window_start', detail: 'Outpost entered dark window' },
      { t: 150, type: 'battery_empty', detail: 'Outpost energy storage fully exhausted' },
      { t: 151, type: 'load_off', detail: 'Load shed: life_support' },
      { t: 229, type: 'failure', detail: 'Mission lost: critical deficit threshold breached for oxygen' },
    ],
  };

  const PopulatedReview: React.FC = () => {
    const { dispatch } = useAppStore();
    React.useEffect(() => {
      dispatch({
        type: 'SET_CAMPAIGN_RESULT',
        result: mockCampaign,
        worstRun: mockWorstMission,
      });
    }, [dispatch]);
    return <ReviewScreen />;
  };

  it('renders rating banner, survival rates, and Wilson intervals (AC2, AC3)', () => {
    render(
      <AppStoreProvider>
        <PopulatedReview />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.review.heading)).toBeDefined();
    expect(screen.getByText(copy.review.flightReadyTitle)).toBeDefined();
    expect(screen.getByText('96.0%')).toBeDefined();
    expect(screen.getByText('[93.2%, 97.8%]')).toBeDefined();
    expect(screen.getByText('[80.5%, 88.7%]')).toBeDefined();
  });

  it('scrubs timeline through worst seed mission ticks (AC5, AC8)', () => {
    render(
      <AppStoreProvider>
        <PopulatedReview />
      </AppStoreProvider>,
    );

    const scrubber = screen.getByLabelText('Mission hour replay scrubber') as HTMLInputElement;
    expect(scrubber).toBeDefined();

    fireEvent.change(scrubber, { target: { value: '150' } });
    expect(scrubber.value).toBe('150');
    expect(screen.getAllByText(/Hour 150/).length).toBeGreaterThanOrEqual(1);
  });

  it('displays cause chain and concept hint (AC6)', () => {
    render(
      <AppStoreProvider>
        <PopulatedReview />
      </AppStoreProvider>,
    );

    expect(screen.getByText(copy.review.causeChainTitle)).toBeDefined();
    expect(screen.getByText(copy.review.conceptHintTitle)).toBeDefined();
  });
});
