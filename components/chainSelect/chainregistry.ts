/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L8-L12
 */
export interface ChainRegistryDemonUnit {
  denom: string;
  exponent: number;
  aliases: string[];
}

/**
 * See https://github.com/cosmos/chain-registry/blob/1e9ecde770951cab90f0853a624411d79af90b83/provenance/assetlist.json#L5-L28
 */
export interface ChainRegistryAsset {
  description: string;
  denom_units: ChainRegistryDemonUnit[];
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
