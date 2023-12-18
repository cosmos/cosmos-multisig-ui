import { RegistryAsset } from "@/types/chainRegistry";
import { emptyChain } from "./helpers";
import { ChainInfo, ChainItems, ExplorerLinks } from "./types";

const registryShaStorageKey = "context-registry-sha";
export const getShaFromStorage = () => localStorage.getItem(registryShaStorageKey);
export const setShaInStorage = (sha: string) => localStorage.setItem(registryShaStorageKey, sha);

const chainsStorageKey = "context-chain-items";

export const getChainsFromStorage = () => {
  const storedChains = localStorage.getItem(chainsStorageKey);
  if (!storedChains) {
    const chains: ChainItems = { mainnets: new Map(), testnets: new Map(), localnets: new Map() };
    return chains;
  }

  const { mainnets, testnets, localnets } = JSON.parse(storedChains);

  const chains: ChainItems = {
    mainnets: new Map(mainnets),
    testnets: new Map(testnets),
    localnets: new Map(localnets),
  };

  return chains;
};

export const setChainsInStorage = (chains: ChainItems) => {
  const arrayMainnets = Array.from(chains.mainnets.entries());
  const arrayTestnets = Array.from(chains.testnets.entries());
  const arrayLocalnets = Array.from(chains.localnets.entries());

  const stringChains = JSON.stringify({
    mainnets: arrayMainnets,
    testnets: arrayTestnets,
    localnets: arrayLocalnets,
  });

  localStorage.setItem(chainsStorageKey, stringChains);
};

export const addLocalChainInStorage = (chain: ChainInfo, chains: ChainItems) => {
  chains.localnets.set(chain.registryName, chain);
  setChainsInStorage(chains);
};

export const deleteLocalChainFromStorage = (chainName: string, chains: ChainItems) => {
  chains.localnets.delete(chainName);
  setChainsInStorage(chains);
};

const recentChainsStorageKey = "context-recent-chains";

export const getRecentChainNamesFromStorage = () => {
  const storedNames = localStorage.getItem(recentChainsStorageKey);
  if (!storedNames) return [];

  const chainNames: readonly string[] = JSON.parse(storedNames);
  return chainNames;
};

export const setRecentChainNamesInStorage = (chainNames: readonly string[]) => {
  const stringChainNames = JSON.stringify(chainNames);
  localStorage.setItem(recentChainsStorageKey, stringChainNames);
};

export const addRecentChainNameInStorage = (chainName: string) => {
  const storedNames = getRecentChainNamesFromStorage();
  const newChains = storedNames.filter((storedName) => storedName !== chainName);

  setRecentChainNamesInStorage([chainName, ...newChains.slice(0, 3)]);
};

export const getRecentChainsFromStorage = (chains: ChainItems) => {
  const recentChainNames = getRecentChainNamesFromStorage();

  const recentChains = recentChainNames.map((chainName) => {
    const chain =
      chains.localnets.get(chainName) ??
      chains.testnets.get(chainName) ??
      chains.mainnets.get(chainName);
    return chain ?? null;
  });

  const nonNullRecentChains: readonly ChainInfo[] = recentChains.filter(
    (chain): chain is ChainInfo => chain !== null,
  );

  return nonNullRecentChains;
};

export const getRecentChainFromStorage = (chains: ChainItems): Partial<ChainInfo> => {
  const recentChains = getRecentChainsFromStorage(chains);
  const recentChain = recentChains?.[0] ?? {};

  return recentChain;
};

export const getChainFromUrl = (chainName: string) => {
  if (!chainName) {
    return { registryName: chainName };
  }

  const params = new URLSearchParams(location.search);

  const logo = params.get("logo");
  const chainId = params.get("chainId");
  const chainDisplayName = params.get("chainDisplayName");
  const nodeAddresses = params.get("nodeAddresses");
  const denom = params.get("denom");
  const displayDenom = params.get("displayDenom");
  const displayDenomExponent = params.get("displayDenomExponent");
  const assets = params.get("assets");
  const gasPrice = params.get("gasPrice");
  const addressPrefix = params.get("addressPrefix");
  const explorerLinks = params.get("explorerLinks");

  const nodeAddressesValue: readonly string[] = JSON.parse(nodeAddresses || "[]");
  const assetsValue: readonly RegistryAsset[] = JSON.parse(assets || "[]");
  const explorerLinkValue: Partial<ExplorerLinks> = JSON.parse(explorerLinks || "{}");

  const urlChain: Partial<ChainInfo> = {
    registryName: chainName,
    ...(logo && { logo }),
    ...(chainId && { chainId }),
    ...(chainDisplayName && { chainDisplayName }),
    ...(nodeAddressesValue.length && { nodeAddress: "" }),
    ...(nodeAddressesValue.length && { nodeAddresses: nodeAddressesValue }),
    ...(denom && { denom }),
    ...(displayDenom && { displayDenom }),
    ...(displayDenomExponent && { displayDenomExponent: Number(displayDenomExponent) }),
    ...(assetsValue.length && { assets: assetsValue }),
    ...(gasPrice && { gasPrice }),
    ...(addressPrefix && { addressPrefix }),
    ...(explorerLinks && {
      explorerLinks: { tx: explorerLinkValue.tx || "", account: explorerLinkValue.account || "" },
    }),
  };

  return urlChain;
};

export const getChainFromEnvfile = (chainName: string) => {
  const registryName = process.env.NEXT_PUBLIC_REGISTRY_NAME || "";
  if (chainName && registryName !== chainName) {
    return { registryName: chainName };
  }

  const logo = process.env.NEXT_PUBLIC_LOGO;
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  const chainDisplayName = process.env.NEXT_PUBLIC_CHAIN_DISPLAY_NAME;
  const nodeAddresses = process.env.NEXT_PUBLIC_NODE_ADDRESSES;
  const denom = process.env.NEXT_PUBLIC_DENOM;
  const displayDenom = process.env.NEXT_PUBLIC_DISPLAY_DENOM;
  const displayDenomExponent = process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT;
  const assets = process.env.NEXT_PUBLIC_ASSETS;
  const gasPrice = process.env.NEXT_PUBLIC_GAS_PRICE;
  const addressPrefix = process.env.NEXT_PUBLIC_ADDRESS_PREFIX;
  // An object containing link templates for txs and accounts
  const explorerLinks = process.env.NEXT_PUBLIC_EXPLORER_LINKS;

  const nodeAddressesValue: readonly string[] = JSON.parse(nodeAddresses || "[]");
  const assetsValue: readonly RegistryAsset[] = JSON.parse(assets || "[]");
  const explorerLinksValue: Partial<ExplorerLinks> = JSON.parse(explorerLinks || "{}");

  const envfileChain: Partial<ChainInfo> = {
    registryName: chainName,
    ...(logo && { logo }),
    ...(chainId && { chainId }),
    ...(chainDisplayName && { chainDisplayName }),
    ...(nodeAddressesValue.length && { nodeAddress: "" }),
    ...(nodeAddressesValue.length && { nodeAddresses: nodeAddressesValue }),
    ...(denom && { denom }),
    ...(displayDenom && { displayDenom }),
    ...(displayDenomExponent && { displayDenomExponent: Number(displayDenomExponent) }),
    ...(assetsValue.length && { assets: assetsValue }),
    ...(gasPrice && { gasPrice }),
    ...(addressPrefix && { addressPrefix }),
    ...(explorerLinksValue && {
      explorerLinks: { tx: explorerLinksValue.tx || "", account: explorerLinksValue.account || "" },
    }),
  };

  return envfileChain;
};

export const getChainFromStorage = (
  chainName: string | null,
  { localnets, testnets, mainnets }: ChainItems,
) => {
  if (!chainName) {
    return emptyChain;
  }

  return (
    localnets.get(chainName) ?? testnets.get(chainName) ?? mainnets.get(chainName) ?? emptyChain
  );
};

export const setChainInUrl = (chain: ChainInfo, chains: ChainItems) => {
  const newPathname = location.pathname.includes(chain.registryName)
    ? location.pathname
    : `/${chain.registryName}`;

  if (chains.mainnets.has(chain.registryName) || chains.testnets.has(chain.registryName)) {
    window.history.replaceState({}, "", newPathname);
    return;
  }

  // Set full url if chain is not on chain-registry repo
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(chain)) {
    if (typeof value === "object") {
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, value);
    }
  }

  const newUrl = params.size ? `${newPathname}?${params}` : newPathname;

  window.history.replaceState({}, "", newUrl);
};
