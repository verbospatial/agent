import {
  SpatialBounds,
  SpatialDeclaration,
  SpatialTransactionDraft,
  createSpatialTransactionDraft,
} from '../../spatial/spatialTransactions';
import { MinAmountCruzbits } from '../../utils/constants';

export interface ControllerPosition {
  x: number;
  y: number;
  z: number;
}

export const MAX_CONTROLLER_SPEED = 1_000_000;

const normalizeCoordinate = (coordinate: number) =>
  Number.isFinite(coordinate) ? Math.max(0, coordinate) : 0;

export const normalizeControllerSpeed = (value: string | number | null | undefined) => {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return 1;

  return Math.min(MAX_CONTROLLER_SPEED, Math.max(1, speed));
};

export const normalizeControllerPosition = (position: ControllerPosition): ControllerPosition => ({
  x: normalizeCoordinate(position.x),
  y: normalizeCoordinate(position.y),
  z: normalizeCoordinate(position.z),
});

export interface ControllerSettings {
  namespace: string;
  geometry: string;
  color: string;
  amountCruzbits: number;
  dimensions: { width: number; height: number; depth: number };
}

export const defaultControllerSettings: ControllerSettings = {
  namespace: '',
  geometry: 'box',
  color: '0x33aaff',
  amountCruzbits: MinAmountCruzbits,
  dimensions: { width: 1, height: 1, depth: 1 },
};

export const createMovementDeclaration = (
  settings: ControllerSettings,
  position: ControllerPosition,
): SpatialDeclaration => {
  const normalizedPosition = normalizeControllerPosition(position);
  const bounds: SpatialBounds = {
    x: normalizedPosition.x,
    width: settings.dimensions.width,
    y: normalizedPosition.y,
    height: settings.dimensions.height,
    z: normalizedPosition.z,
    depth: settings.dimensions.depth,
  };

  return {
    name: settings.namespace,
    bounds,
    properties: {
      geometry: settings.geometry,
      color: settings.color,
    },
  };
};

export const createControllerDraft = (
  settings: ControllerSettings,
  position: ControllerPosition,
) =>
  createSpatialTransactionDraft({
    ...createMovementDeclaration(settings, position),
    amountCruzbits: settings.amountCruzbits,
  });


export const tryCreateControllerDraft = (
  settings: ControllerSettings,
  position: ControllerPosition,
): { draft: SpatialTransactionDraft; error?: undefined } | { draft?: undefined; error: string } => {
  try {
    return { draft: createControllerDraft(settings, position) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid spatial transaction draft',
    };
  }
};
