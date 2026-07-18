import { describe, expect, it } from 'vitest';
import {
  createSpatialMemo,
  formatSpatialAxis,
  formatSpatialPath,
  serializeSpatialProperties,
} from './spatialTransactions';
import { explorerDeclarationFixtures } from './__fixtures__/explorerDeclarations';

describe('spatial transaction formatting', () => {
  it('formats explorer axis segments', () => {
    expect(formatSpatialAxis(0, 1)).toEqual('+0+1');
    expect(formatSpatialAxis('10c', '50c')).toEqual('+10c+50c');
  });

  it('formats explorer declaration paths', () => {
    expect(formatSpatialPath(explorerDeclarationFixtures[2])).toEqual(
      'Sofa/Cushion/+3+5/+0+3/+0+15',
    );
  });

  it('serializes declaration properties', () => {
    expect(serializeSpatialProperties({ geometry: 'box', color: '0x33aaff' })).toEqual(
      'geometry: box; color: 0x33aaff',
    );
  });

  it('creates compact memos compatible with explorer declarations', () => {
    expect(createSpatialMemo(explorerDeclarationFixtures[0])).toEqual(
      'Box/+0+1/+0+1/+0+1 : geometry: box; color: 0x33aaff',
    );
  });

  it('rejects over-limit memos', () => {
    expect(() =>
      createSpatialMemo({
        name: 'VeryLongControllerName'.repeat(5),
        bounds: { x: 0, width: 1, y: 0, height: 1, z: 0, depth: 1 },
        properties: { content: 'x'.repeat(150) },
      }),
    ).toThrow(/exceeds/);
  });
});
