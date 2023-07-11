import { StdFee } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";

declare global {
  interface Window {
    keplr: {
      defaultOptions: {
        sign: { preferNoSetFee: boolean; preferNoSetMemo: boolean; disableBalanceCheck: boolean };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enable: (chainId: string) => any;
      getKey: (chainId: string) => Promise<WalletAccount>;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOfflineSignerOnlyAmino: any;
  }
}

export interface DbSignature {
  bodyBytes: string;
  signature: string;
  address: string;
}

export interface DbTransaction {
  accountNumber: number;
  sequence: number;
  chainId: string;
  msgs: EncodeObject[];
  fee: StdFee;
  memo: string;
}

export interface DbAccount {
  address: string;
  pubkeyJSON: string;
  chainId: string;
}

export interface WalletAccount {
  address?: Uint8Array;
  pubKey: Uint8Array;
  algo: string;
  bech32Address: string;
  isNanoLedger?: boolean;
  name?: string;
}
