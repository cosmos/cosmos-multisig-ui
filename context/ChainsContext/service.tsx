import { StargateClient } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { requestJson } from "../../lib/request";
import {
  GithubChainRegistryItem,
  RegistryAsset,
  RegistryChain,
  RegistryChainApisRpc,
  RegistryChainExplorer,
} from "../../types/chainRegistry";
import { emptyChain, isChainInfoFilled } from "./helpers";
import {
  getChainFromEnvfile,
  getChainFromStorage,
  getChainFromUrl,
  setChainInStorage,
  setChainInUrl,
} from "./storage";
import { ChainInfo, ChainItems } from "./types";

const chainsUrl = "https://api.github.com/repos/cosmos/chain-registry/contents";
const testnetsUrl = "https://api.github.com/repos/cosmos/chain-registry/contents/testnets";
const registryGhUrl = "https://cdn.jsdelivr.net/gh/cosmos/chain-registry/";

const nonChainsFilter = (item: GithubChainRegistryItem) =>
  item.type === "dir" && !item.name.startsWith(".") && !item.name.startsWith("_");

export const useChainsFromRegistry = () => {
  const [chainItems, setChainItems] = useState<ChainItems>({ mainnets: [], testnets: [] });
  const [chainItemsError, setChainItemsError] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      try {
        const [mainnets, testnets] = await Promise.all([
          requestJson(chainsUrl),
          requestJson(testnetsUrl),
        ]);
        setChainItems({
          mainnets: mainnets.filter(nonChainsFilter),
          testnets: testnets.filter(nonChainsFilter),
        });
      } catch (e) {
        if (e instanceof Error) {
          setChainItemsError(e.message);
        } else {
          setChainItemsError("Failed to get chains from registry");
        }
      }
    })();
  }, []);

  return { chainItems, chainItemsError };
};

export const getChainItemFromRegistry = async (chainName: string, isTestnet?: boolean) => {
  const chainGhPath = isTestnet ? "testnets/" + chainName : chainName;
  const chainGhUrl = registryGhUrl + chainGhPath + "/chain.json";

  const chain: RegistryChain = await requestJson(chainGhUrl);
  // const chain: RegistryChain = await (await fetch(chainGhUrl)).json();
  return chain;
};

export const getAssetItemsFromRegistry = async (chainName: string, isTestnet?: boolean) => {
  const assetsGhPath = isTestnet ? "testnets/" + chainName : chainName;
  const assetsGhUrl = registryGhUrl + assetsGhPath + "/assetlist.json";

  const assets: readonly RegistryAsset[] = (await requestJson(assetsGhUrl)).assets;
  // const assets: readonly RegistryAsset[] = (await (await fetch(assetsGhUrl)).json()).assets;
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

export const useChainFromRegistry = (chain: ChainInfo, chains: ChainItems) => {
  const [chainFromRegistry, setChainFromRegistry] = useState<ChainInfo>(chain);
  const [chainFromRegistryError, setChainFromRegistryError] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      try {
        if (isChainInfoFilled(chain) || !chains.mainnets.length || !chains.testnets.length) {
          return;
        }

        const isTestnet = !!chains.testnets.find(({ name }) => name === chain.registryName);
        const chainItem = await getChainItemFromRegistry(chain.registryName, isTestnet);
        const registryAssets = await getAssetItemsFromRegistry(chain.registryName, isTestnet);
        const firstAsset = registryAssets[0];

        const nodeAddress = await getNodeFromArray(chainItem.apis.rpc);
        const explorerLink = getExplorerFromArray(chainItem.explorers);
        const firstAssetDenom = firstAsset.base;
        const displayDenom = firstAsset.symbol;
        const displayUnit = firstAsset.denom_units.find((u) => u.denom == firstAsset.display);

        if (!displayUnit) {
          return setChainFromRegistryError(`Unit not found for ${firstAsset.display}`);
        }

        const feeToken = chainItem.fees.fee_tokens.find(
          (token) => token.denom == firstAssetDenom,
        ) ?? {
          denom: firstAssetDenom,
        };
        const gasPrice =
          feeToken.average_gas_price ??
          feeToken.low_gas_price ??
          feeToken.high_gas_price ??
          feeToken.fixed_min_gas_price ??
          0.03;
        const formattedGasPrice = firstAsset ? `${gasPrice}${firstAssetDenom}` : "";

        const newChain: ChainInfo = {
          registryName: chain.registryName,
          addressPrefix: chainItem.bech32_prefix,
          chainId: chainItem.chain_id,
          chainDisplayName: chainItem.pretty_name,
          nodeAddress,
          explorerLink,
          denom: firstAssetDenom,
          displayDenom,
          displayDenomExponent: displayUnit.exponent,
          gasPrice: formattedGasPrice,
          assets: registryAssets,
        };

        if (!isChainInfoFilled(newChain)) {
          setChainFromRegistryError(
            `Chain ${newChain.registryName} loaded from the registry with missing data`,
          );
          return;
        }

        setChainFromRegistry(newChain);
      } catch (e) {
        if (e instanceof Error) {
          setChainFromRegistryError(e.message);
        } else {
          setChainFromRegistryError(`Failed to get chain ${chain.registryName} from registry`);
        }
      }
    })();
  }, [chain, chains.mainnets.length, chains.testnets]);

  return { chainFromRegistry, chainFromRegistryError };
};

export const getChain = () => {
  if (typeof window === "undefined") return emptyChain;

  const rootRoute = location.pathname.split("/")[1];
  // Avoid app from thinking the /create and /api routes are registryNames
  const chainNameFromUrl = ["create", "api"].includes(rootRoute) ? null : rootRoute;

  const chainFromUrl = getChainFromUrl(chainNameFromUrl);
  if (chainFromUrl) {
    setChainInStorage(chainFromUrl);
    return chainFromUrl;
  }

  const chainFromStorage = getChainFromStorage(chainNameFromUrl);
  if (chainFromStorage) {
    setChainInUrl(chainFromStorage);
    return chainFromStorage;
  }

  const chainFromEnvfile = getChainFromEnvfile(chainNameFromUrl);
  if (chainFromEnvfile) {
    setChainInStorage(chainFromEnvfile);
    setChainInUrl(chainFromEnvfile);
    return chainFromEnvfile;
  }

  return { ...emptyChain, registryName: chainNameFromUrl || "cosmoshub" };
};
