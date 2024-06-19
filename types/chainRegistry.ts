export interface GithubChainRegistryItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GithubTreeItem {
  readonly path: string;
  readonly mode: string;
  readonly type: string;
  readonly sha: string;
  readonly size: number;
  readonly url: string;
}

export interface GithubTreesResponse {
  readonly tree: readonly GithubTreeItem[];
}

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
  readonly tx_page?: string;
  readonly account_page?: string;
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
  readonly apis?: RegistryChainApis;
  readonly bech32_prefix: string;
  readonly chain_id: string;
  readonly chain_name: string;
  readonly explorers?: readonly RegistryChainExplorer[];
  readonly fees?: RegistryChainFees;
  readonly pretty_name: string;
  readonly logo_URIs?: {
    readonly png?: string;
    readonly svg?: string;
  };
}

/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L8-L12
 */
export interface RegistryAssetDenomUnit {
  readonly denom: string;
  readonly exponent: number;
  readonly aliases?: readonly string[];
}

export interface AssetTrace {
  readonly type?: "string";
  readonly chain?: {
    readonly channel_id?: string;
    readonly path?: string;
  };
  readonly counterparty?: {
    readonly chain_name?: string;
    readonly base_denom?: string;
    readonly channel_id?: string;
  };
}

/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L5-L28
 */
export interface RegistryAsset {
  readonly denom_units: readonly RegistryAssetDenomUnit[];
  readonly base: string;
  readonly display: string;
  readonly name: string;
  readonly symbol: string;
  readonly description?: string;
  readonly logo_URIs?: {
    readonly png: string;
    readonly svg: string;
  };
  readonly coingecko_id?: string;
  readonly traces?: readonly AssetTrace[];
}
