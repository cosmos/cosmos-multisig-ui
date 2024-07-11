import { ChainInfo, ChainItems, Dispatch, NewConnection } from "./types";

export const emptyChain: ChainInfo = {
  registryName: "",
  logo: "",
  chainId: "",
  chainDisplayName: "",
  nodeAddress: "",
  nodeAddresses: [],
  denom: "",
  displayDenom: "",
  displayDenomExponent: 0,
  assets: [],
  gasPrice: "",
  addressPrefix: "",
  explorerLinks: { tx: "", account: "" },
};

export const isChainInfoFilled = (chain: Partial<ChainInfo>): chain is ChainInfo =>
  Boolean(
    chain.registryName &&
      typeof chain.logo === "string" &&
      chain.chainId &&
      chain.chainDisplayName &&
      typeof chain.nodeAddress === "string" &&
      chain.nodeAddresses?.length &&
      chain.denom &&
      chain.displayDenom &&
      chain.displayDenomExponent !== undefined &&
      chain.displayDenomExponent >= 0 &&
      chain.assets?.length &&
      chain.gasPrice &&
      chain.addressPrefix,
  );

export const setChains = (dispatch: Dispatch, chains: ChainItems) => {
  dispatch({ type: "setChains", payload: chains });
};

export const setChain = (dispatch: Dispatch, chain: ChainInfo) => {
  dispatch({ type: "setChain", payload: chain });
};

export const loadValidators = (dispatch: Dispatch) => {
  dispatch({ type: "loadValidators" });
};

export const setNewConnection = (dispatch: Dispatch, newConnection: NewConnection) => {
  dispatch({ type: "setNewConnection", payload: newConnection });
};

export const setChainsError = (dispatch: Dispatch, chainsError: string | null) => {
  dispatch({ type: "setChainsError", payload: chainsError });
};
