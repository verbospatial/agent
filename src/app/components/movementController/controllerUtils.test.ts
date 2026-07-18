import { describe, expect, it } from 'vitest';
import { createControllerDraft, defaultControllerSettings } from './controllerUtils';

describe('controller draft generation', () => {
  it('maps controller position into explorer spatial memo', () => {
    const draft = createControllerDraft(
      { ...defaultControllerSettings, targetAddress: 'A'.repeat(43) + '=' },
      { x: 2, y: 0, z: -1 },
    );

    expect(draft.memo).toEqual(
      'Controller/+2+1/+0+1/+-1+1 : geometry: box; color: 0x33aaff',
    );
  });
});
