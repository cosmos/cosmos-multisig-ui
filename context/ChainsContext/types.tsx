import { GithubChainRegistryItem, RegistryAsset } from "../../types/chainRegistry";

export interface ChainsContextType {
  readonly state: State;
  readonly dispatch: Dispatch;
}

export interface State {
  readonly chains: ChainItems;
  readonly chain: ChainInfo;
  readonly chainsError?: string | null;
}

export type Dispatch = (action: Action) => void;

export interface ChainItems {
  readonly mainnets: readonly GithubChainRegistryItem[];
  readonly testnets: readonly GithubChainRegistryItem[];
}

export interface ChainInfo {
  readonly registryName: string;
  readonly chainId: string;
  readonly chainDisplayName: string;
  readonly nodeAddress: string;
  readonly denom: string;
  readonly displayDenom: string;
  readonly displayDenomExponent: number;
  readonly assets: readonly RegistryAsset[];
  readonly gasPrice: string;
  readonly addressPrefix: string;
  readonly explorerLink: string;
}

export type Action =
  | {
      readonly type: "setChains";
      readonly payload: ChainItems;
    }
  | {
      readonly type: "setChain";
      readonly payload: ChainInfo;
    }
  | {
      readonly type: "setChainsError";
      readonly payload: string | null;
    };
