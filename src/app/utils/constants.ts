export const BLOCKS_UNTIL_NEW_SERIES = 1008;
export const GENESIS_BLOCK_ID =
  '00000000e29a7850088d660489b7b9ae2da763bc3bd83324ecc54eee04840adb';
export const BASELINE_CRUZBIT_NODE = `sure-formerly-filly.ngrok-free.app/${GENESIS_BLOCK_ID}`;
export const OVERLAY_CRUZBIT_NODE =
  'ungallant-unimpeding-kade.ngrok-free.dev/000006913ccf73b5990eb4833e4cdbd5ef58061384481ff1f6cee3cb7f18b2cd';
export const DEFAULT_CRUZBIT_NODE = BASELINE_CRUZBIT_NODE;
export const CRUZBIT_NODES = [
  { label: 'Baseline', value: BASELINE_CRUZBIT_NODE },
  { label: 'Overlay', value: OVERLAY_CRUZBIT_NODE },
] as const;
export const MinFeeCruzbits = 1000000 // 0.01 cruz
export const MinAmountCruzbits = 1000000 // 0.01 cruz
