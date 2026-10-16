import { describe, expect, it } from 'vitest';
import defaultParamsJson from '../../data/params.json' with { type: 'json' };
import { loadParams, REQUIRED_PARAM_IDS } from '../../src/engine/params.ts';
import { EngineError } from '../../src/engine/types.ts';

describe('loadParams and params validation (Spec B6, AC2)', () => {
  it('loads default params.json successfully with all required IDs', () => {
    const params = loadParams();
    expect(params.version).toBe('0.1.0');

    for (const id of REQUIRED_PARAM_IDS) {
      const entry = params.get(id);
      expect(entry).toBeDefined();
      expect(entry.unit).toBeTypeOf('string');
      expect(entry.source).toBeTypeOf('string');
      expect(entry.confidence).toBeTypeOf('string');
      expect(entry.note).toBeTypeOf('string');
    }
  });

  it('provides typed getters for number and number arrays', () => {
    const params = loadParams();
    expect(params.getNumber('mission.hours')).toBe(720);
    expect(params.getNumber('mass.budget')).toBe(120);

    const shieldFactors = params.getNumberArray('radiation.shield_factor_by_layers');
    expect(shieldFactors).toEqual([1.0, 0.67, 0.5, 0.4]);

    const darkStarts = params.getNumberArray('site.ridge.dark_starts_h');
    expect(darkStarts).toEqual([200, 560]);
  });

  it('throws EngineError when root or version is invalid', () => {
    expect(() => loadParams(null)).toThrow(EngineError);
    expect(() => loadParams([])).toThrow(EngineError);
    expect(() => loadParams({ version: '', params: {} })).toThrow(EngineError);
    expect(() => loadParams({ version: '1.0' })).toThrow(EngineError);
  });

  it('throws EngineError when a required param ID is missing', () => {
    const cloned = JSON.parse(JSON.stringify(defaultParamsJson));
    delete cloned.params['mass.budget'];

    expect(() => loadParams(cloned)).toThrow(EngineError);
    try {
      loadParams(cloned);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe('MISSING_PARAM_ID');
    }
  });

  it('throws EngineError when an unknown field exists in a param entry', () => {
    const cloned = JSON.parse(JSON.stringify(defaultParamsJson));
    cloned.params['mass.budget'].extraField = 'not allowed';

    expect(() => loadParams(cloned)).toThrow(EngineError);
    try {
      loadParams(cloned);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe('UNKNOWN_PARAM_FIELD');
    }
  });

  it('throws EngineError when value type is wrong', () => {
    const cloned = JSON.parse(JSON.stringify(defaultParamsJson));
    cloned.params['mass.budget'].value = 'one-hundred-twenty';

    expect(() => loadParams(cloned)).toThrow(EngineError);
    try {
      loadParams(cloned);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe('INVALID_PARAM_VALUE');
    }
  });

  it('throws EngineError when source is unknown', () => {
    const cloned = JSON.parse(JSON.stringify(defaultParamsJson));
    cloned.params['mass.budget'].source = 'WIKIPEDIA';

    expect(() => loadParams(cloned)).toThrow(EngineError);
    try {
      loadParams(cloned);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe('INVALID_PARAM_SOURCE');
    }
  });

  it('throws EngineError when confidence is unknown', () => {
    const cloned = JSON.parse(JSON.stringify(defaultParamsJson));
    cloned.params['mass.budget'].confidence = 'extreme';

    expect(() => loadParams(cloned)).toThrow(EngineError);
    try {
      loadParams(cloned);
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe('INVALID_PARAM_CONFIDENCE');
    }
  });

  it('throws EngineError on getter type mismatch', () => {
    const params = loadParams();
    expect(() => params.getNumber('radiation.shield_factor_by_layers')).toThrow(EngineError);
    expect(() => params.getNumberArray('mission.hours')).toThrow(EngineError);
    expect(() => params.get('non.existent.id')).toThrow(EngineError);
  });
});
