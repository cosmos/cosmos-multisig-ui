import React, { useEffect, createContext, useContext, useReducer } from "react";

import { AppReducer, initialState } from "./AppReducer";

const AppContext = createContext();

function getChainInfoFromUrl() {
  const url = location.search;
  const params = new URLSearchParams(url);
  const chainInfo = {
    nodeAddress: decodeURIComponent(params.get("nodeAddress")),
    denom: params.get("denom"),
    displayDenom: params.get("displayDenom"),
    displayDenomExponent: parseInt(params.get("displayDenomExponent"), 10),
    gasPrice: params.get("gasPrice"),
    chainId: params.get("chainId"),
    chainDisplayName: decodeURIComponent(params.get("chainDisplayName")),
    addressPrefix: params.get("addressPrefix"),
    explorerLink: decodeURIComponent(params.get("explorerLink")),
  };

  return chainInfo;
}

function setChainInfoParams(chainInfo) {
  const params = new URLSearchParams();

  Object.keys(chainInfo).forEach((key) => {
    params.set(key, encodeURIComponent(chainInfo[key]));
  });

  window.history.replaceState({}, "", `${location.pathname}?${params}`);
}

export function AppWrapper({ children }) {
  let existingState;
  if (typeof window !== "undefined") {
    existingState = JSON.parse(localStorage.getItem("state"));
    const urlChainInfo = getChainInfoFromUrl();

    // query params should override saved state
    if (urlChainInfo.chainId) {
      console.log("setting state from url");
      existingState = { chain: urlChainInfo };
    }
  }
  const [state, dispatch] = useReducer(AppReducer, existingState ? existingState : initialState);

  const contextValue = { state, dispatch };

  useEffect(() => {
    if (state && state !== initialState) {
      localStorage.setItem("state", JSON.stringify(state));
      setChainInfoParams(state.chain);
    }
  }, [state]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  return useContext(AppContext);
}
