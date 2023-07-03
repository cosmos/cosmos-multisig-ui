import { isChainInfoFilled } from "./helpers";
import { ChainInfo } from "./types";

const localStorageKey = "context-chain-info";

export const getChainFromUrl = (chainName: string | undefined) => {
  const params = new URLSearchParams(location.search);

  const chain: ChainInfo = {
    registryName: chainName || "",
    chainId: decodeURIComponent(params.get("chainId") || ""),
    nodeAddress: decodeURIComponent(params.get("nodeAddress") || ""),
    denom: decodeURIComponent(params.get("denom") || ""),
    displayDenom: decodeURIComponent(params.get("displayDenom") || ""),
    displayDenomExponent: Number(decodeURIComponent(params.get("displayDenomExponent") || "")),
    assets: JSON.parse(decodeURIComponent(params.get("assets") || "[]")),
    gasPrice: decodeURIComponent(params.get("gasPrice") || ""),
    chainDisplayName: decodeURIComponent(params.get("chainDisplayName") || ""),
    addressPrefix: decodeURIComponent(params.get("addressPrefix") || ""),
    explorerLink: decodeURIComponent(params.get("explorerLink") || ""),
  };

  return isChainInfoFilled(chain) ? chain : null;
};

const setChainInUrl = ({ registryName, ...restChainFields }: ChainInfo) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(restChainFields)) {
    if (typeof value === "object") {
      params.set(key, encodeURIComponent(JSON.stringify(value)));
    } else {
      params.set(key, encodeURIComponent(value ?? ""));
    }
  }

  window.history.replaceState({}, registryName, `${location.pathname}?${params}`);
};

export const getChainFromStorage = (chainName: string | undefined) => {
  const storedChain = localStorage.getItem(localStorageKey);
  if (!storedChain) return null;

  const chain: ChainInfo = JSON.parse(storedChain);
  const isChainNameValid = chain.registryName === chainName || !chainName;
  return isChainNameValid && isChainInfoFilled(chain) ? chain : null;
};

const setChainInStorage = (chain: ChainInfo) => {
  const stringChain = JSON.stringify(chain);
  localStorage.setItem(localStorageKey, stringChain);
};

export const storeChain = (chain: ChainInfo) => {
  setChainInStorage(chain);
  setChainInUrl(chain);
};

export const getChainFromEnvfile = (chainName: string | undefined) => {
  const chain: ChainInfo = {
    nodeAddress: process.env.NEXT_PUBLIC_NODE_ADDRESS || "",
    denom: process.env.NEXT_PUBLIC_DENOM || "",
    displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM || "",
    displayDenomExponent: Number(process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT || 0),
    assets: JSON.parse(process.env.NEXT_PUBLIC_ASSETS || "[]"),
    gasPrice: process.env.NEXT_PUBLIC_GAS_PRICE || "",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "",
    chainDisplayName: process.env.NEXT_PUBLIC_CHAIN_DISPLAY_NAME || "",
    registryName: process.env.NEXT_PUBLIC_REGISTRY_NAME || "",
    addressPrefix: process.env.NEXT_PUBLIC_ADDRESS_PREFIX || "",
    explorerLink: process.env.NEXT_PUBLIC_EXPLORER_LINK_TX || "",
  };

  const isChainNameValid = chain.registryName === chainName || !chainName;
  return isChainNameValid && isChainInfoFilled(chain) ? chain : null;
};
