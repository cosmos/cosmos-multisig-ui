import { Coin } from "@cosmjs/amino";
import { sha512 } from "@cosmjs/crypto";
import { fromBase64, fromBech32, toBase64, toBech32 } from "@cosmjs/encoding";
import { Decimal } from "@cosmjs/math";
import { ChainInfo } from "../types";

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ellideMiddle(str: string, maxOutLen: number): string {
  if (str.length <= maxOutLen) {
    return str;
  }
  const ellide = "…";
  const frontLen = Math.ceil((maxOutLen - ellide.length) / 2);
  const tailLen = Math.floor((maxOutLen - ellide.length) / 2);
  return str.slice(0, frontLen) + ellide + str.slice(str.length - tailLen, str.length);
}

// NARROW NO-BREAK SPACE (U+202F)
const thinSpace = "\u202F";

/**
 * Takes a Coin (e.g. `{"amount": "1234", "denom": "uatom"}`) and converts it into a user-readable string.
 *
 * The chainInfo provided displayDenom/displayDenomExponent
 * will be used if the denom matches the denom stored in the chainInfo object.
 *
 * A leading "u" is interpreted as µ (micro) and uxyz will be converted to XYZ
 * for displaying.
 *
 * @param {object} coin (e.g. `{"amount": "1234", "denom": "uatom"}`)
 * @param {object} chainInfo Provides information about a chain (e.g. node, prefix, denomination), object structure defined in '../context/AppReducer'.
 * @return {string} The abbreviated string.
 */
const printableCoin = (coin: Coin, chainInfo: ChainInfo) => {
  if (!coin.amount || !coin.denom) return "";

  // Check if denom is in assets
  const foundAsset = chainInfo.assets?.find(
    (asset) => asset.denom.toLowerCase() === coin.denom.toLowerCase(),
  );

  // Check if denom starting with "u" has a macrodenom in assets
  const foundMacrodenom = coin.denom.startsWith("u")
    ? chainInfo.assets?.find(
        (asset) => asset.denom.toLowerCase() === coin.denom.slice(1).toLowerCase(),
      )
    : undefined;

  const assetToPrint = foundMacrodenom ?? foundAsset;

  if (assetToPrint) {
    const value = Decimal.fromAtomics(coin.amount ?? "0", assetToPrint.exponent).toString();
    const ticker = assetToPrint.denom.toUpperCase();
    return value + thinSpace + ticker;
  }

  // Ellide IBC tokens
  if (coin.denom.startsWith("ibc/")) {
    const value = coin.amount;
    const hash = coin.denom.slice(4);
    const ellidedHash = ellideMiddle(hash, 11);
    const ticker = `ibc/${ellidedHash}`.toUpperCase();
    return value + thinSpace + ticker;
  }

  // Fallback to plain coin display
  return coin.amount + thinSpace + coin.denom.toUpperCase();
};

const printableCoins = (coins: readonly Coin[], chainInfo: ChainInfo) =>
  coins
    .map((coin) => printableCoin(coin, chainInfo))
    .filter((str) => !!str)
    .join(", ");

/**
 * Generates an example address for the configured blockchain.
 *
 * `index` can be set to a small integer in order to get different addresses.
 */
function exampleAddress(index: number, chainAddressPrefix: string): string {
  let data = fromBech32("cosmos1vqpjljwsynsn58dugz0w8ut7kun7t8ls2qkmsq").data;
  for (let i = 0; i < index; ++i) {
    data = sha512(data).slice(0, data.length); // hash one time and trim to original length
  }
  return toBech32(chainAddressPrefix, data);
}

/**
 * Generates an example address for the configured blockchain.
 *
 * `index` can be set to a small integer in order to get different addresses.
 */
function exampleValidatorAddress(index: number, chainAddressPrefix: string): string {
  let data = fromBech32("cosmosvaloper10v6wvdenee8r9l6wlsphcgur2ltl8ztkfrvj9a").data;
  for (let i = 0; i < index; ++i) {
    data = sha512(data).slice(0, data.length); // hash one time and trim to original length
  }
  const validatorPrefix = chainAddressPrefix + "valoper";
  return toBech32(validatorPrefix, data);
}

/**
 * Generates an example pubkey (secp256k1, compressed).
 *
 * `index` can be set to a small integer in order to get different addresses.
 *
 * Note: the keys are not necessarily valid (as in points on the chain) and should only be used
 * as dummy data.
 */
function examplePubkey(index: number): string {
  let data = fromBase64("Akd/qKMWdZXyiMnSu6aFLpQEGDO0ijyal9mXUIcVaPNX");
  for (let i = 0; i < index; ++i) {
    data = sha512(data).slice(0, data.length); // hash one time and trim to original length
    data[0] = index % 2 ? 0x02 : 0x03; // pubkeys have to start with 0x02 or 0x03
  }
  return toBase64(data);
}

/**
 * Returns an error message for invalid addresses.
 * Returns null of there is no error.
 *
 * If `chainAddressPrefix` is null, the prefix check will be skipped.
 */
const checkAddress = (input: string, chainAddressPrefix: string | null) => {
  if (!input) return "Empty";

  let data;
  let prefix;
  try {
    ({ data, prefix } = fromBech32(input));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return error.toString();
  }

  if (chainAddressPrefix) {
    if (!prefix.startsWith(chainAddressPrefix)) {
      return `Expected address prefix '${chainAddressPrefix}' but got '${prefix}'`;
    }
  } else {
    // any prefix is allowed
  }

  if (data.length !== 20 && data.length !== 32) {
    return "Invalid address length in bech32 data. Expected 20 or 32 bytes.";
  }

  return null;
};

/**
 * Returns a link to a transaction in an explorer if an explorer is configured
 * for transactions. Returns null otherwise.
 */
const explorerLinkTx = (link: string, hash: string) => {
  if (link && link.includes("${txHash}")) {
    return link.replace("${txHash}", hash);
  }
  return null;
};

/**
 * Returns a link to an account in an explorer if an explorer is configured
 * for accounts. Returns null otherwise.
 */
const explorerLinkAccount = (link: string, address: string) => {
  if (link && link.includes("${address}")) {
    return link.replace("${address}", address);
  }
  return null;
};

export {
  thinSpace,
  capitalizeFirstLetter,
  ellideMiddle,
  printableCoin,
  printableCoins,
  exampleAddress,
  exampleValidatorAddress,
  examplePubkey,
  checkAddress,
  explorerLinkTx,
  explorerLinkAccount,
};
