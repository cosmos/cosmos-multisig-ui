import { StdFee } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";

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
