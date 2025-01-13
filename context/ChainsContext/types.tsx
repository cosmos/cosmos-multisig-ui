import { RegistryAsset } from "../../types/chainRegistry";
import { AllValidators } from "@/lib/staking";

export interface ChainsContextType {
  readonly state: State;
  readonly dispatch: Dispatch;
}

export interface State {
  readonly chains: ChainItems;
  readonly chain: ChainInfo;
  readonly validatorState: ValidatorState;
  readonly newConnection: NewConnection;
  readonly chainsError?: string | null;
}

export type Dispatch = (action: Action) => void;

export interface ChainItems {
  readonly mainnets: Map<string, ChainInfo>;
  readonly testnets: Map<string, ChainInfo>;
  readonly localnets: Map<string, ChainInfo>;
}

export interface ChainInfo {
  readonly registryName: string;
  readonly logo: string;
  readonly chainId: string;
  readonly chainDisplayName: string;
  readonly nodeAddress: string;
  readonly nodeAddresses: readonly string[];
  readonly denom: string;
  readonly displayDenom: string;
  readonly displayDenomExponent: number;
  readonly assets: readonly RegistryAsset[];
  readonly gasPrice: string;
  readonly addressPrefix: string;
  readonly explorerLinks: ExplorerLinks;
}

export interface ValidatorState {
  readonly validators: AllValidators;
  readonly status: "initial" | "loading" | "done" | "error";
}

export type ExplorerLinks = {
  readonly tx: string;
  readonly account: string;
};

export type NewConnection =
  | {
      readonly action: "edit";
      readonly chain?: ChainInfo;
    }
  | {
      readonly action: "confirm";
      readonly chain: ChainInfo;
    };

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
      readonly type: "addNodeAddress";
      readonly payload: string;
    }
  | {
      readonly type: "loadValidators";
    }
  | {
      readonly type: "setValidatorState";
      readonly payload: ValidatorState;
    }
  | {
      readonly type: "setNewConnection";
      readonly payload: NewConnection;
    }
  | {
      readonly type: "setChainsError";
      readonly payload: string | null;
    };
