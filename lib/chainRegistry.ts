import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { ChainInfo, ChainItems, ExplorerLink } from "@/context/ChainsContext/types";
import { GithubChainRegistryItem, RegistryAsset, RegistryChain } from "@/types/chainRegistry";
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

const getChainsFromRegistry = async () => {
  const [mainnetGhItems, testnetGhItems]: [
    readonly GithubChainRegistryItem[],
    readonly GithubChainRegistryItem[],
  ] = await Promise.all([requestGhJson(mainnetsUrl), requestGhJson(testnetsUrl)]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mainnetChainJsonPromises: Promise<any>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mainnetAssetListJsonPromises: Promise<any>[] = [];

  for (const { type, path } of mainnetGhItems) {
    if (
      type !== "dir" ||
      path.startsWith(".") ||
      path.startsWith("_") ||
      path === "testnets" ||
      path.includes("thorchain") ||
      path.includes("xion")
    ) {
      continue;
    }

    mainnetChainJsonPromises.push(requestGhJson(`${registryCdnUrl}/${path}/chain.json`));
    mainnetAssetListJsonPromises.push(requestGhJson(`${registryCdnUrl}/${path}/assetlist.json`));
  }

  const mainnetChainJsons: readonly RegistryChain[] = await Promise.all(mainnetChainJsonPromises);
  const mainnetAssetListJsons = (await Promise.all(mainnetAssetListJsonPromises)).map(
    ({ assets }: { assets: readonly RegistryAsset[] }) => assets,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testnetChainJsonPromises: Promise<any>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testnetAssetListJsonPromises: Promise<any>[] = [];

  for (const { type, path } of testnetGhItems) {
    if (type !== "dir" || path.startsWith("testnets/.") || path.startsWith("testnets/_")) {
      continue;
    }

    testnetChainJsonPromises.push(requestGhJson(`${registryCdnUrl}/${path}/chain.json`));
    testnetAssetListJsonPromises.push(requestGhJson(`${registryCdnUrl}/${path}/assetlist.json`));
  }

  const testnetChainJsons: readonly RegistryChain[] = await Promise.all(testnetChainJsonPromises);
  const testnetAssetListJsons = (await Promise.all(testnetAssetListJsonPromises)).map(
    ({ assets }: { assets: readonly RegistryAsset[] }) => assets,
  );

  const chains: ChainItems = { mainnets: new Map(), testnets: new Map(), localnets: new Map() };

  for (let i = 0; i < mainnetChainJsons.length; i++) {
    const chain = getChainInfoFromJsons(mainnetChainJsons[i], mainnetAssetListJsons[i]);
    if (isChainInfoFilled(chain)) {
      chains.mainnets.set(chain.registryName, chain);
    }
  }

  for (let i = 0; i < testnetChainJsons.length; i++) {
    const chain = getChainInfoFromJsons(testnetChainJsons[i], testnetAssetListJsons[i]);
    if (isChainInfoFilled(chain)) {
      chains.testnets.set(chain.registryName, chain);
    }
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

  let explorerLink: ExplorerLink = { tx: "", account: "" };

  // Prefer same explorer for both tx and account links
  for (const explorer of registryChain.explorers ?? []) {
    if (explorer.tx_page && explorer.account_page) {
      explorerLink = { tx: explorer.tx_page, account: explorer.account_page };
      break;
    }

    if (!explorerLink.tx && explorer.tx_page) {
      explorerLink = { ...explorerLink, tx: explorer.tx_page };
    }

    if (!explorerLink.account && explorer.account_page) {
      explorerLink = { ...explorerLink, account: explorer.account_page };
    }
  }

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
