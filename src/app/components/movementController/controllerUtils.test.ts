import { describe, expect, it } from 'vitest';
import { createControllerDraft, defaultControllerSettings } from './controllerUtils';

describe('controller draft generation', () => {
  it('maps controller position into a to field prefixed only by object namespace', () => {
    const draft = createControllerDraft(
      defaultControllerSettings,
      { x: 2, y: 0, z: -1 },
    );

    expect(draft.to).toEqual('Controller/+2+1/+0+1/+-1+1/0000000000000000=');
    expect(draft.memo).toEqual('geometry: box; color: 0x33aaff');
  });

  it('uses the configured object namespace as the only generated to prefix', () => {
    const draft = createControllerDraft(
      { ...defaultControllerSettings, namespace: 'Avatar' },
      { x: 0, y: 0, z: 0 },
    );

    expect(draft.to).toEqual('Avatar/+0+1/+0+1/+0+1/000000000000000000000=');
  });
});
