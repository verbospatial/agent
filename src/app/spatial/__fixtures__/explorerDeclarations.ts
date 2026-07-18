import { SpatialDeclaration } from '../spatialTransactions';

export const explorerDeclarationFixtures: SpatialDeclaration[] = [
  {
    name: 'Box',
    bounds: { x: 0, width: 1, y: 0, height: 1, z: 0, depth: 1 },
    properties: { geometry: 'box', color: '0x33aaff' },
  },
  {
    name: 'Sphere',
    bounds: { x: '10c', width: '50c', y: 0, height: 1, z: '10c', depth: '50c' },
    properties: { geometry: 'sphere', material: 'plastic' },
  },
  {
    name: 'Sofa/Cushion',
    bounds: { x: 3, width: 5, y: 0, height: 3, z: 0, depth: 15 },
    properties: { geometry: 'box', color: 'red' },
  },
];
