import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { ChainInfo, ChainItems } from "@/context/ChainsContext/types";
import { GithubChainRegistryItem, RegistryAsset, RegistryChain } from "@/types/chainRegistry";
import { preventUnhandledRejections } from "./promises";
import { requestGhJson } from "./request";

const chainRegistryRepo = "cosmos/chain-registry";
const repoBranch = "master";
const shaUrl = `https://api.github.com/repos/${chainRegistryRepo}/commits/${repoBranch}`;
const mainnetsUrl = `https://api.github.com/repos/${chainRegistryRepo}/contents`;
const testnetsUrl = `https://api.github.com/repos/${chainRegistryRepo}/contents/testnets`;
const registryCdnUrl = `https://cdn.jsdelivr.net/gh/${chainRegistryRepo}@${repoBranch}`;

const getShaFromRegistry = async () => {
  const { sha }: { sha: string } = await requestGhJson(shaUrl);
  return sha;
};

interface RegistryPromises {
  readonly chainInfo: Promise<RegistryChain>;
  readonly assetList: Promise<{ readonly assets: readonly RegistryAsset[] }>;
}

const getChainsFromRegistry = async () => {
  const chains: ChainItems = { mainnets: new Map(), testnets: new Map(), localnets: new Map() };

  const [mainnetGhItems, testnetGhItems]: [
    readonly GithubChainRegistryItem[],
    readonly GithubChainRegistryItem[],
  ] = await Promise.all([requestGhJson(mainnetsUrl), requestGhJson(testnetsUrl)]);

  const mainnetPromisesMap = new Map<string, RegistryPromises>();

  for (const { type, path } of mainnetGhItems) {
    if (type !== "dir" || path.startsWith(".") || path.startsWith("_") || path === "testnets") {
      continue;
    }

    mainnetPromisesMap.set(path, {
      chainInfo: requestGhJson(`${registryCdnUrl}/${path}/chain.json`),
      assetList: requestGhJson(`${registryCdnUrl}/${path}/assetlist.json`),
    });
  }

  const mainnetPromisesArray = [
    ...Array.from(mainnetPromisesMap.values()).map(({ chainInfo }) => chainInfo),
    ...Array.from(mainnetPromisesMap.values()).map(({ assetList }) => assetList),
  ];

  preventUnhandledRejections(...mainnetPromisesArray);
  await Promise.allSettled(mainnetPromisesArray);

  for (const { chainInfo, assetList } of mainnetPromisesMap.values()) {
    try {
      const registryChain = await chainInfo;
      const { assets }: { assets: readonly RegistryAsset[] } = await assetList;
      const chain = getChainInfoFromJsons(registryChain, assets);

      if (isChainInfoFilled(chain)) {
        chains.mainnets.set(chain.registryName, chain);
      }
    } catch {}
  }

  const testnetPromisesMap = new Map<string, RegistryPromises>();

  for (const { type, path } of testnetGhItems) {
    if (type !== "dir" || path.startsWith("testnets/.") || path.startsWith("testnets/_")) {
      continue;
    }

    testnetPromisesMap.set(path, {
      chainInfo: requestGhJson(`${registryCdnUrl}/${path}/chain.json`),
      assetList: requestGhJson(`${registryCdnUrl}/${path}/assetlist.json`),
    });
  }

  const testnetPromisesArray = [
    ...Array.from(testnetPromisesMap.values()).map(({ chainInfo }) => chainInfo),
    ...Array.from(testnetPromisesMap.values()).map(({ assetList }) => assetList),
  ];

  preventUnhandledRejections(...testnetPromisesArray);
  await Promise.allSettled(testnetPromisesArray);

  for (const { chainInfo, assetList } of testnetPromisesMap.values()) {
    try {
      const registryChain = await chainInfo;
      const { assets }: { assets: readonly RegistryAsset[] } = await assetList;
      const chain = getChainInfoFromJsons(registryChain, assets);

      if (isChainInfoFilled(chain)) {
        chains.testnets.set(chain.registryName, chain);
      }
    } catch {}
  }

  return chains;
};

const getParsedCdnLogoUri = (registryUri: string | undefined) => {
  if (!registryUri?.includes("github") || !registryUri.includes(chainRegistryRepo)) {
    return registryUri;
  }

  const [, path] = registryUri.split(`${chainRegistryRepo}/${repoBranch}`);
  return `${registryCdnUrl}${path}`;
};

const getLogoUri = (
  { logo_URIs: chainUris }: RegistryChain,
  { logo_URIs: firstAssetUris }: RegistryAsset,
) =>
  getParsedCdnLogoUri(chainUris?.svg) ||
  getParsedCdnLogoUri(chainUris?.png) ||
  firstAssetUris?.svg ||
  firstAssetUris?.png ||
  "";

const getChainInfoFromJsons = (
  registryChain: RegistryChain,
  registryAssets: readonly RegistryAsset[],
): ChainInfo => {
  const cdnRegistryAssets: readonly RegistryAsset[] = registryAssets.map(
    ({ logo_URIs, ...restProps }) => ({
      logo_URIs: logo_URIs
        ? {
            png: getParsedCdnLogoUri(logo_URIs.png) || "",
            svg: getParsedCdnLogoUri(logo_URIs.svg) || "",
          }
        : undefined,
      ...restProps,
    }),
  );

  const firstAsset = cdnRegistryAssets[0];
  const logo = getLogoUri(registryChain, firstAsset);
  const nodeAddresses = registryChain.apis?.rpc.map(({ address }) => address) ?? [];
  const explorerLink = registryChain.explorers?.[0]?.tx_page ?? "";
  const firstAssetDenom = firstAsset.base;
  const displayUnit = firstAsset.denom_units.find((u) => u.denom == firstAsset.display);
  const displayDenom = displayUnit ? firstAsset.symbol : firstAsset.base;
  const displayDenomExponent = displayUnit
    ? displayUnit.exponent
    : firstAsset.denom_units[0].exponent;

  const feeToken = registryChain.fees?.fee_tokens.find(
    (token) => token.denom == firstAssetDenom,
  ) ?? { denom: firstAssetDenom };

  const gasPrice =
    feeToken.average_gas_price ??
    feeToken.low_gas_price ??
    feeToken.high_gas_price ??
    feeToken.fixed_min_gas_price ??
    0.03;

  const formattedGasPrice = firstAsset ? `${gasPrice}${firstAssetDenom}` : "";

  const chain: ChainInfo = {
    registryName: registryChain.chain_name,
    logo,
    addressPrefix: registryChain.bech32_prefix,
    chainId: registryChain.chain_id,
    chainDisplayName: registryChain.pretty_name,
    nodeAddresses,
    nodeAddress: "",
    explorerLink,
    denom: firstAssetDenom,
    displayDenom,
    displayDenomExponent,
    gasPrice: formattedGasPrice,
    assets: cdnRegistryAssets,
  };

  return chain;
};

export { getChainsFromRegistry, getShaFromRegistry };
