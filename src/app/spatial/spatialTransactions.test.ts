import { describe, expect, it } from 'vitest';
import {
  createSpatialMemo,
  createSpatialTransactionDraft,
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


  it('omits the path prefix when the declaration name is empty', () => {
    expect(formatSpatialPath({ ...explorerDeclarationFixtures[0], name: '' })).toEqual(
      '+0+1/+0+1/+0+1',
    );
  });

  it('serializes declaration properties', () => {
    expect(serializeSpatialProperties({ geometry: 'box', color: '0x33aaff' })).toEqual(
      'geometry: box; color: 0x33aaff',
    );
  });

  it('puts the spatial coordinates in the padded to field', () => {
    expect(createSpatialTransactionDraft(explorerDeclarationFixtures[0]).to).toEqual(
      'Box/+0+1/+0+1/+0+1/000000000000000000000000=',
    );
  });

  it('creates memos with object properties only', () => {
    expect(createSpatialMemo(explorerDeclarationFixtures[0])).toEqual(
      'geometry: box; color: 0x33aaff',
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
