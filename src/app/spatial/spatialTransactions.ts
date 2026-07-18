import { MinAmountCruzbits } from '../utils/constants';
import { getUtf8ByteLength, MAX_MEMO_BYTES } from '../utils/transactionValidation';

export type SpatialUnitValue = number | `${number}c`;

export interface SpatialBounds {
  x: SpatialUnitValue;
  width: SpatialUnitValue;
  y: SpatialUnitValue;
  height: SpatialUnitValue;
  z: SpatialUnitValue;
  depth: SpatialUnitValue;
}

export interface SpatialDeclaration {
  name: string;
  bounds: SpatialBounds;
  properties: Record<string, string | number | boolean | undefined>;
}

export interface SpatialTransactionDraft {
  to: string;
  memo: string;
  amountCruzbits: number;
}

const sanitizeSegment = (value: string) =>
  value.trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9._/-]/g, '').replace(/^\/+|\/+$/g, '');

const formatUnit = (value: SpatialUnitValue) => `${value}`;

export const formatSpatialAxis = (start: SpatialUnitValue, size: SpatialUnitValue) =>
  `+${formatUnit(start)}+${formatUnit(size)}`;

export const formatSpatialPath = ({ name, bounds }: Pick<SpatialDeclaration, 'name' | 'bounds'>) => {
  const safeName = sanitizeSegment(name) || 'Controller';
  return [
    safeName,
    formatSpatialAxis(bounds.x, bounds.width),
    formatSpatialAxis(bounds.y, bounds.height),
    formatSpatialAxis(bounds.z, bounds.depth),
  ].join('/');
};

export const serializeSpatialProperties = (
  properties: SpatialDeclaration['properties'],
) =>
  Object.entries(properties)
    .filter(([, value]) => value !== undefined && `${value}`.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

export const createSpatialMemo = (declaration: SpatialDeclaration) => {
  const memo = `${formatSpatialPath(declaration)} : ${serializeSpatialProperties(
    declaration.properties,
  )}`;

  if (getUtf8ByteLength(memo) > MAX_MEMO_BYTES) {
    throw new Error(`Spatial memo exceeds ${MAX_MEMO_BYTES} bytes`);
  }

  return memo;
};

export const createSpatialTransactionDraft = ({
  to,
  amountCruzbits = MinAmountCruzbits,
  ...declaration
}: SpatialDeclaration & { to: string; amountCruzbits?: number }): SpatialTransactionDraft => ({
  to,
  memo: createSpatialMemo(declaration),
  amountCruzbits,
});
