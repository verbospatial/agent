export const BLOCKS_UNTIL_NEW_SERIES = 1008;
export const GENESIS_BLOCK_ID =
  '00000000e29a7850088d660489b7b9ae2da763bc3bd83324ecc54eee04840adb';
export const PRIMARY_CRUZBIT_NODE = `sure-formerly-filly.ngrok-free.app/${GENESIS_BLOCK_ID}`;
export const SECONDARY_CRUZBIT_NODE =
  'ungallant-unimpeding-kade.ngrok-free.dev/000000b179a6172473845cbc913598edef179aabb31108324694ca1b12a19e32';
export const DEFAULT_CRUZBIT_NODE = PRIMARY_CRUZBIT_NODE;
export const CRUZBIT_NODES = [
  { label: 'Primary', value: PRIMARY_CRUZBIT_NODE },
  { label: 'Secondary', value: SECONDARY_CRUZBIT_NODE },
] as const;
export const MinFeeCruzbits = 1000000 // 0.01 cruz
export const MinAmountCruzbits = 1000000 // 0.01 cruz
