// Unit tests for scenario code encoding, decoding, versioning, and error rejection
// Spec Part C (L8 AC4, AC5)

import { describe, expect, it } from 'vitest';
import { missionPresets } from '../../src/content/missions.ts';
import {
  decodeScenarioCode,
  encodeScenarioCode,
  SCENARIO_CODE_VERSION,
} from '../../src/state/scenarioCode.ts';

describe('Scenario Code Encoder and Decoder (Spec Part C L8 AC4, AC5)', () => {
  const sampleDesign = missionPresets[0]!.design;
  const sampleRules = missionPresets[0]!.rules;

  it('encodes code with version number prefix MM1- (AC5)', () => {
    const code = encodeScenarioCode(sampleDesign, sampleRules);
    expect(code.startsWith(`MM${SCENARIO_CODE_VERSION}-`)).toBe(true);
  });

  it('round-trips encode and decode to match identical configuration (AC4)', () => {
    const code = encodeScenarioCode(sampleDesign, sampleRules);
    const decoded = decodeScenarioCode(code);

    expect(decoded.design).toEqual(sampleDesign);
    expect(decoded.rules).toEqual(sampleRules);
  });

  it('rejects corrupt or tampered base64 string with clear EngineError (AC4)', () => {
    expect(() => decodeScenarioCode('MM1-invalid!base64@@')).toThrowError();
    expect(() => decodeScenarioCode('MM1-bm90IGEganNvbg')).toThrowError(/CORRUPT_SCENARIO_CODE/);
  });

  it('rejects empty or malformed prefix (AC4, AC5)', () => {
    expect(() => decodeScenarioCode('')).toThrowError(/INVALID_SCENARIO_CODE/);
    expect(() => decodeScenarioCode('V2-somecode')).toThrowError(/INVALID_SCENARIO_CODE/);
  });

  it('rejects oversized input exceeding 2048 characters (AC4)', () => {
    const hugeCode = 'MM1-' + 'A'.repeat(2500);
    expect(() => decodeScenarioCode(hugeCode)).toThrowError(/OVERSIZED_SCENARIO_CODE/);
  });

  it('validates bounds on panels, batteries, and rules during decoding (AC4)', () => {
    const corruptPayload = {
      v: 1,
      d: { ...sampleDesign, panels: 99 }, // Invalid panels > 8
      r: sampleRules,
    };
    const b64 = btoa(JSON.stringify(corruptPayload));
    expect(() => decodeScenarioCode(`MM1-${b64}`)).toThrowError(/Panels must be an integer/);
  });
});
