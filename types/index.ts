import { StdFee } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    keplr: Keplr;
  }
}

export interface DbSignature {
  bodyBytes: string;
  signature: string;
  address: string;
}

export interface DbTransaction {
  id: string;
  txHash: string;
  dataJSON: string;
  signatures: DbSignature[];
}

export interface DbTransactionJsonObj {
  accountNumber: number;
  sequence: number;
  chainId: string;
  msgs: EncodeObject[];
  fee: StdFee;
  memo: string;
}

export interface DbMultisig {
  chainId: string;
  address: string;
  creator: string;
  pubkeyJSON: string;
}

export type DbNonce = {
  readonly chainId: string;
  readonly address: string;
  readonly nonce: number;
};

export interface WalletAccount {
  address?: Uint8Array;
  pubKey: Uint8Array;
  algo: string;
  bech32Address: string;
  isNanoLedger?: boolean;
  name?: string;
}
