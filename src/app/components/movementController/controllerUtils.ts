import { SpatialBounds, SpatialDeclaration, createSpatialTransactionDraft } from '../../spatial/spatialTransactions';
import { MinAmountCruzbits } from '../../utils/constants';

export interface ControllerPosition {
  x: number;
  y: number;
  z: number;
}

export interface ControllerSettings {
  namespace: string;
  geometry: string;
  color: string;
  amountCruzbits: number;
  dimensions: { width: number; height: number; depth: number };
}

export const defaultControllerSettings: ControllerSettings = {
  namespace: 'Controller',
  geometry: 'box',
  color: '0x33aaff',
  amountCruzbits: MinAmountCruzbits,
  dimensions: { width: 1, height: 1, depth: 1 },
};

export const createMovementDeclaration = (
  settings: ControllerSettings,
  position: ControllerPosition,
  suffix?: string,
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
    name: suffix ? `${settings.namespace}/${suffix}` : settings.namespace,
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
    amountCruzbits: settings.amountCruzbits,
  });
