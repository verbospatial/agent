import { SpatialBounds, SpatialDeclaration, createSpatialTransactionDraft } from '../../spatial/spatialTransactions';
import { MinAmountCruzbits } from '../../utils/constants';

export interface ControllerPosition {
  x: number;
  y: number;
  z: number;
}

export interface ControllerSettings {
  targetAddress: string;
  namespace: string;
  geometry: string;
  color: string;
  amountCruzbits: number;
  dimensions: { width: number; height: number; depth: number };
}

export const defaultControllerSettings: ControllerSettings = {
  targetAddress: '',
  namespace: 'Controller',
  geometry: 'box',
  color: '0x33aaff',
  amountCruzbits: MinAmountCruzbits,
  dimensions: { width: 1, height: 1, depth: 1 },
};

export const createMovementDeclaration = (
  settings: ControllerSettings,
  position: ControllerPosition,
  suffix = 'Body',
): SpatialDeclaration => {
  const bounds: SpatialBounds = {
    x: position.x,
    width: settings.dimensions.width,
    y: position.y,
    height: settings.dimensions.height,
    z: position.z,
    depth: settings.dimensions.depth,
  };

  return {
    name: `${settings.namespace}/${suffix}`,
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
  suffix?: string,
) =>
  createSpatialTransactionDraft({
    ...createMovementDeclaration(settings, position, suffix),
    to: settings.targetAddress,
    amountCruzbits: settings.amountCruzbits,
  });
