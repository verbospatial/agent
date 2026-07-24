import { describe, expect, it } from 'vitest';
import {
  createControllerDraft,
  defaultControllerSettings,
  tryCreateControllerDraft,
} from './controllerUtils';

describe('controller draft generation', () => {
  it('clamps negative coordinates when object namespace is empty', () => {
    const draft = createControllerDraft(
      defaultControllerSettings,
      { x: 2, y: 0, z: -1 },
    );

    expect(draft.to).toMatch(/^\+2\+1\/\+0\+1\/\+0\+1\/0+=$/);
    expect(draft.memo).toEqual('geometry: box; color: 0x33aaff');
  });

  it('uses the configured object namespace as the only generated to prefix', () => {
    const draft = createControllerDraft(
      { ...defaultControllerSettings, namespace: 'Avatar' },
      { x: 0, y: 0, z: 0 },
    );

    expect(draft.to).toEqual('Avatar/+0+1/+0+1/+0+1/000000000000000000000=');
  });

  it('clamps controller coordinates at the origin', () => {
    const draft = createControllerDraft(
      defaultControllerSettings,
      { x: -2, y: -3, z: -1 },
    );

    expect(draft.to).toMatch(/^\+0\+1\/\+0\+1\/\+0\+1\/0+=$/);
  });

  it('returns validation errors instead of throwing for invalid drafts', () => {
    const result = tryCreateControllerDraft(
      { ...defaultControllerSettings, geometry: 'x'.repeat(151) },
      { x: 0, y: 0, z: 0 },
    );

    expect(result.draft).toBeUndefined();
    expect(result.error).toMatch(/exceeds/);
  });
});
