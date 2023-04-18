import axios from "axios";

export interface RegistryChainApisRpc {
  readonly address: string;
  readonly provider: string;
}

export interface RegistryChainApis {
  readonly rpc: readonly RegistryChainApisRpc[];
}

export interface RegistryChainExplorer {
  readonly kind: string;
  readonly url: string;
  readonly tx_page: string;
}

export interface RegistryChainFeeTokens {
  readonly denom: string;
  readonly average_gas_price?: number;
  readonly low_gas_price?: number;
  readonly high_gas_price?: number;
  readonly fixed_min_gas_price?: number;
}

export interface RegistryChainFees {
  readonly fee_tokens: readonly RegistryChainFeeTokens[];
}

export interface RegistryChain {
  readonly apis: RegistryChainApis;
  readonly bech32_prefix: string;
  readonly chain_id: string;
  readonly explorers: readonly RegistryChainExplorer[];
  readonly fees: RegistryChainFees;
  readonly pretty_name: string;
}

export interface RegistryChainResponse {
  readonly data: RegistryChain;
}

/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L8-L12
 */
export interface RegistryAssetDenomUnit {
  denom: string;
  exponent: number;
  aliases: string[];
}

/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L5-L28
 */
export interface RegistryAsset {
  description: string;
  denom_units: RegistryAssetDenomUnit[];
  base: string;
  name: string;
  display: string;
  symbol: string;
  logo_URIs: {
    png: string;
    svg: string;
  };
  coingecko_id: string;
}

export interface RegistryAssetsResponse {
  readonly data: { readonly assets: readonly RegistryAsset[] };
}

const registryGhUrl = "https://cdn.jsdelivr.net/gh/cosmos/chain-registry@master/";

export const getChainFromRegistry = async (chainGhName: string): Promise<RegistryChain> => {
  const chainGhUrl = registryGhUrl + chainGhName + "/chain.json";

  const { data: chain }: RegistryChainResponse = await axios.get(chainGhUrl);
  return chain;
};

export const getAssetsFromRegistry = async (
  chainGhName: string,
): Promise<readonly RegistryAsset[]> => {
  const assetsGhUrl = registryGhUrl + chainGhName + "/assetlist.json";

  const {
    data: { assets },
  }: RegistryAssetsResponse = await axios.get(assetsGhUrl);

  return assets;
};
