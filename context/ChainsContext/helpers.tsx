import { ChainInfo, ChainItems, Dispatch } from "./types";

export const emptyChain: ChainInfo = {
  nodeAddress: "",
  denom: "",
  displayDenom: "",
  displayDenomExponent: 0,
  assets: [],
  gasPrice: "",
  chainId: "",
  chainDisplayName: "",
  registryName: "",
  addressPrefix: "",
  explorerLink: "",
};

export const isChainInfoFilled = ({ displayDenomExponent, assets, ...restFields }: ChainInfo) =>
  displayDenomExponent >= 0 &&
  assets.length > 0 &&
  Object.values(restFields).every((value) => value !== "");

export const setChains = (dispatch: Dispatch, chains: ChainItems) => {
  dispatch({ type: "setChains", payload: chains });
};

export const setChain = (dispatch: Dispatch, chain: ChainInfo) => {
  dispatch({ type: "setChain", payload: chain });
};

export const setChainFromRegistry = (dispatch: Dispatch, chainName: string) => {
  dispatch({ type: "setChain", payload: { ...emptyChain, registryName: chainName } });
};

export const setChainsError = (dispatch: Dispatch, chainsError: string | null) => {
  dispatch({ type: "setChainsError", payload: chainsError });
};
