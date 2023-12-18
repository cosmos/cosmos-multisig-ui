export type SigningStatus = "not_signed" | "not_a_member" | "signed";

export type WalletType = "Keplr" | "Ledger";

export interface WalletInfo {
  readonly type: WalletType;
  readonly address: string;
  readonly pubKey: string;
}

export interface LoadingStates {
  readonly signing?: boolean;
  readonly keplr?: boolean;
  readonly ledger?: boolean;
}
