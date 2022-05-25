import { ChainInfo } from "../types";
import { AppContextType } from "./AppContext";

export const initialState: AppContextType = {
  chain: {
    nodeAddress: process.env.NEXT_PUBLIC_NODE_ADDRESS,
    denom: process.env.NEXT_PUBLIC_DENOM,
    displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM,
    displayDenomExponent: parseInt(process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT || "", 10),
    gasPrice: process.env.NEXT_PUBLIC_GAS_PRICE,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    chainDisplayName: process.env.NEXT_PUBLIC_CHAIN_DISPLAY_NAME,
    registryName: process.env.NEXT_PUBLIC_REGISTRY_NAME,
    addressPrefix: process.env.NEXT_PUBLIC_ADDRESS_PREFIX,
    explorerLink: process.env.NEXT_PUBLIC_EXPLORER_LINK_TX,
  },
};

export interface ChangeChainAction {
  type: "changeChain";
  value: ChainInfo;
}

export const AppReducer = (state: AppContextType, action: ChangeChainAction) => {
  switch (action.type) {
    case "changeChain": {
      return {
        ...state,
        chain: action.value,
      };
    }
  }
};
