import { createContext } from 'react';
import {
  Block,
  BlockIdHeaderPair,
  Transaction,
} from '../utils/appTypes';

interface AppState {
  publicKeys: string[][];
  setPublicKeys: (keys: string[][]) => void;
  selectedKeyIndex: [number, number];
  setSelectedKeyIndex: (index: [number, number]) => void;
  label: string;
  setLabel: (label: string) => void;
  requestTipHeader: () => void;
  tipHeader?: BlockIdHeaderPair;
  setTipHeader: (tipHeader: BlockIdHeaderPair) => void;
  requestBlockByHeight: (height: number) => void;
  requestBlockById: (block_id: string) => void;
  currentBlock?: Block | null;
  setCurrentBlock: (currentBlock: Block) => void;
  genesisBlock?: Block | null;
  setGenesisBlock: (genesisBlock: Block) => void;
  requestTransaction: (
    transaction_id: string,
    resultHandler: (transaction: Transaction) => void,
  ) => (() => void) | undefined;
  requestPkTransactions: (
    publicKeyB64: string,
    resultHandler: (transactions: Transaction[]) => void,
    options?: {
      startHeight?: number;
      endHeight?: number;
      limit?: number;
    },
  ) => (() => void) | undefined;
  pushTransaction: (
    to: string,
    memo: string,
    amountCruzbits: number,
    passphrase: string,
    label: string,
    selectedKeyIndex: [number, number],
    resultHandler: (data: { transaction_id: string; error: string }) => void,
  ) => Promise<(() => void) | undefined>;

  requestPendingTransactions: (
    publicKeyB64: string,
    resultHandler: (transactions: Transaction[]) => void,
  ) => (() => void) | undefined;
  selectedNode: string;
  setSelectedNode: (node: string) => void;
  colorScheme: 'light' | 'dark';
}

export const AppContext = createContext<AppState>({
  publicKeys: [],
  setPublicKeys: () => {},
  selectedKeyIndex: [0, 0],
  setSelectedKeyIndex: (index: [number, number]) => {},
  label: 'candidspaces',
  setLabel: (label: string) => {},
  tipHeader: undefined,
  requestTipHeader: () => {},
  setTipHeader: () => {},
  requestBlockById: (block_id: string) => {},
  requestBlockByHeight: (height: number) => {},
  currentBlock: undefined,
  setCurrentBlock: (currentBlock: Block) => {},
  genesisBlock: undefined,
  setGenesisBlock: (genesisBlock: Block) => {},
  requestTransaction:
    (transaction_id: string, resultHandler: (transaction: Transaction) => void) =>
    () => {},
  requestPkTransactions:
    (
      publicKeyB64: string,
      resultHandler: (transactions: Transaction[]) => void,
      options?: {
        startHeight?: number;
        endHeight?: number;
        limit?: number;
      },
    ) =>
    () => {},
  requestPendingTransactions:
    (publicKeyB64: string, resultHandler: (transactions: Transaction[]) => void) =>
    () => {},
  selectedNode: '',
  setSelectedNode: () => {},
  colorScheme: 'light',
  pushTransaction: (
    to: string,
    memo: string,
    amountCruzbits: number,
    passphrase: string,
    label: string,
    selectedKeyIndex: [number, number],
    resultHandler: (data: { transaction_id: string; error: string }) => void,
  ) => Promise.resolve(undefined),
});
