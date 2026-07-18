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

const TO_FIELD_DATA_LENGTH = 43;

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

export const formatSpatialToField = (spatialPath: string) => {
  if (spatialPath.length > TO_FIELD_DATA_LENGTH) {
    throw new Error(`Spatial to field path exceeds ${TO_FIELD_DATA_LENGTH} characters`);
  }

  const suffix = spatialPath.length < TO_FIELD_DATA_LENGTH
    ? `/${'0'.repeat(TO_FIELD_DATA_LENGTH - spatialPath.length - 1)}`
    : '';

  return `${spatialPath}${suffix}=`;
};

export const serializeSpatialProperties = (
  properties: SpatialDeclaration['properties'],
) =>
  Object.entries(properties)
    .filter(([, value]) => value !== undefined && `${value}`.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

export const createSpatialMemo = (declaration: SpatialDeclaration) => {
  const memo = serializeSpatialProperties(declaration.properties);

  if (getUtf8ByteLength(memo) > MAX_MEMO_BYTES) {
    throw new Error(`Spatial memo exceeds ${MAX_MEMO_BYTES} bytes`);
  }

  return memo;
};

export const createSpatialTransactionDraft = ({
  amountCruzbits = MinAmountCruzbits,
  ...declaration
}: SpatialDeclaration & { amountCruzbits?: number }): SpatialTransactionDraft => ({
  to: formatSpatialToField(formatSpatialPath(declaration)),
  memo: createSpatialMemo(declaration),
  amountCruzbits,
});
