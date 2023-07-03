import { StargateClient } from "@cosmjs/stargate";
import {
  GithubChainRegistryItem,
  RegistryAsset,
  RegistryChain,
  RegistryChainApisRpc,
  RegistryChainExplorer,
} from "../../types/chainRegistry";
import { emptyChain, isChainInfoFilled } from "./helpers";
import { getChainFromEnvfile, getChainFromStorage, getChainFromUrl } from "./storage";
import { ChainInfo, ChainItems } from "./types";

const chainsUrl = "https://api.github.com/repos/cosmos/chain-registry/contents";
const testnetsUrl = "https://api.github.com/repos/cosmos/chain-registry/contents/testnets";
const registryGhUrl = "https://cdn.jsdelivr.net/gh/cosmos/chain-registry@master/";

const getChains = async (chainUrl: string) => {
  const response = await fetch(chainUrl);
  if (!response.ok) {
    throw new Error("Failed to get chains from registry");
  }

  const chainItems: readonly GithubChainRegistryItem[] = await response.json();
  return chainItems;
};

export const getChainItemsFromRegistry: () => Promise<ChainItems> = async () => {
  const [mainnets, testnets] = await Promise.all([getChains(chainsUrl), getChains(testnetsUrl)]);

  const nonChainsFilter = (item: GithubChainRegistryItem) =>
    item.type === "dir" && !item.name.startsWith(".") && !item.name.startsWith("_");

  return {
    mainnets: mainnets.filter(nonChainsFilter),
    testnets: testnets.filter(nonChainsFilter),
  };
};

export const getChainItemFromRegistry = async (chainName: string, isTestnet?: boolean) => {
  const chainGhPath = isTestnet ? "testnets/" + chainName : chainName;
  const chainGhUrl = registryGhUrl + chainGhPath + "/chain.json";

  const response = await fetch(chainGhUrl);
  if (!response.ok) {
    throw new Error(`Failed to get ${chainName} chain from registry`);
  }

  const chain: RegistryChain = await response.json();
  return chain;
};

export const getAssetItemsFromRegistry = async (chainName: string, isTestnet?: boolean) => {
  const assetsGhPath = isTestnet ? "testnets/" + chainName : chainName;
  const assetsGhUrl = registryGhUrl + assetsGhPath + "/assetlist.json";

  const response = await fetch(assetsGhUrl);
  if (!response.ok) {
    throw new Error(`Failed to get assets for ${chainName} chain from registry`);
  }

  const assets: readonly RegistryAsset[] = (await response.json()).assets;
  return assets;
};

const getNodeFromArray = async (nodeArray: readonly RegistryChainApisRpc[]) => {
  // only return https connections
  const secureNodes = nodeArray
    .filter(({ address }) => address.startsWith("https://"))
    .map(({ address }) => address);

  if (!secureNodes.length) {
    throw new Error("No SSL enabled RPC nodes available for this chain");
  }

  for (const node of secureNodes) {
    try {
      // test client connection
      const client = await StargateClient.connect(node);
      await client.getHeight();
      return node;
    } catch {}
  }

  throw new Error("No RPC nodes available for this chain");
};

const getExplorerFromArray = (explorers: readonly RegistryChainExplorer[]) => {
  return explorers[0]?.tx_page ?? "";
};

export const getChainFromRegistry = async (chainName: string, isTestnet?: boolean) => {
  const chainItem = await getChainItemFromRegistry(chainName, isTestnet);
  const registryAssets = await getAssetItemsFromRegistry(chainName, isTestnet);
  const firstAsset = registryAssets[0];

  const nodeAddress = await getNodeFromArray(chainItem.apis.rpc);
  const explorerLink = getExplorerFromArray(chainItem.explorers);
  const firstAssetDenom = firstAsset.base;
  const displayDenom = firstAsset.symbol;
  const displayUnit = firstAsset.denom_units.find((u) => u.denom == firstAsset.display);
  const displayDenomExponent = displayUnit?.exponent ?? 6; // TODO remove hardcoded fallback 6

  const feeToken = chainItem.fees.fee_tokens.find((token) => token.denom == firstAssetDenom) ?? {
    denom: firstAssetDenom,
  };
  const gasPrice =
    feeToken.average_gas_price ??
    feeToken.low_gas_price ??
    feeToken.high_gas_price ??
    feeToken.fixed_min_gas_price ??
    0.03;
  const formattedGasPrice = firstAsset ? `${gasPrice}${firstAssetDenom}` : "";

  const chain: ChainInfo = {
    registryName: chainName,
    addressPrefix: chainItem.bech32_prefix,
    chainId: chainItem.chain_id,
    chainDisplayName: chainItem.pretty_name,
    nodeAddress,
    explorerLink,
    denom: firstAssetDenom,
    displayDenom,
    displayDenomExponent,
    gasPrice: formattedGasPrice,
    assets: registryAssets,
  };

  if (!isChainInfoFilled(chain)) {
    throw new Error(`Chain ${chainName} loaded from the registry with missing data`);
  }

  return chain;
};

export const getChain = () => {
  if (typeof window === "undefined") return emptyChain;

  const chainName = location.pathname.split("/")[1];
  const chainFromUrl = getChainFromUrl(chainName);
  if (chainFromUrl) return chainFromUrl;

  const chainFromStorage = getChainFromStorage(chainName);
  if (chainFromStorage) return chainFromStorage;

  const chainFromEnvfile = getChainFromEnvfile(chainName);
  if (chainFromEnvfile) return chainFromEnvfile;

  return emptyChain;
};
