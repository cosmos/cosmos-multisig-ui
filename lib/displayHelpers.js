import { Bech32, fromBase64, toBase64 } from "@cosmjs/encoding";
import { sha512 } from "@cosmjs/crypto";
import { Decimal } from "@cosmjs/math";

/**
 * Abbreviates long strings, typically used for
 * addresses and transaction hashes.
 *
 * @param {string} longString The string to abbreviate.
 * @return {string} The abbreviated string.
 */
const abbreviateLongString = (longString) => {
  if (longString.length < 13) {
    // no need to abbreviate
    return longString;
  }

  return longString.slice(0, 5) + "..." + longString.slice(-5);
};

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
const printableCoin = (coin, chainInfo) => {
  // null, undefined and this sort of things
  if (!coin) return "–";

  // The display denom from configuration
  if (coin.denom === chainInfo.denom) {
    const exponent = Number(chainInfo.displayDenomExponent);
    const value = Decimal.fromAtomics(coin.amount ?? "0", exponent).toString();
    const ticker = chainInfo.displayDenom;
    return value + thinSpace + ticker;
  }

  // Auto-convert leading "u"s
  if (coin.denom?.startsWith("u")) {
    const value = Decimal.fromAtomics(coin.amount ?? "0", 6).toString();
    const ticker = coin.denom.slice(1).toUpperCase();
    return value + thinSpace + ticker;
  }

  // Fallback to plain coin display
  return coin.amount + thinSpace + coin.denom;
};

const printableCoins = (coins, chainInfo) => {
  if (coins.length !== 1) {
    throw new Error("Implementation only supports exactly one coin entry.");
  }
  return printableCoin(coins[0], chainInfo);
};

/**
 * Generates an example address for the configured blockchain.
 *
 * `index` can be set to a small integer in order to get different addresses. Defaults to 0.
 */
const exampleAddress = (index, chainAddressPrefix) => {
  const usedIndex = index || 0;
  let data = Bech32.decode("cosmos1vqpjljwsynsn58dugz0w8ut7kun7t8ls2qkmsq").data;
  for (let i = 0; i < usedIndex; ++i) {
    data = sha512(data).slice(0, data.length); // hash one time and trim to original length
  }
  return Bech32.encode(chainAddressPrefix, data);
};

/**
 * Generates an example pubkey (secp256k1, compressed).
 *
 * `index` can be set to a small integer in order to get different addresses. Defaults to 0.
 *
 * Note: the keys are not necessarily valid (as in points on the chain) and should only be used
 * as dummy data.
 */
const examplePubkey = (index) => {
  const usedIndex = index || 0;
  let data = fromBase64("Akd/qKMWdZXyiMnSu6aFLpQEGDO0ijyal9mXUIcVaPNX");
  for (let i = 0; i < usedIndex; ++i) {
    data = sha512(data).slice(0, data.length); // hash one time and trim to original length
    data[0] = index % 2 ? 0x02 : 0x03; // pubkeys have to start with 0x02 or 0x03
  }
  return toBase64(data);
};

/**
 * Returns an error message for invalid addresses.
 *
 * Returns null of there is no error.
 */
const checkAddress = (input, chainAddressPrefix) => {
  if (!input) return "Empty";

  let data;
  let prefix;
  try {
    ({ data, prefix } = Bech32.decode(input));
  } catch (error) {
    return error.toString();
  }

  if (prefix !== chainAddressPrefix) {
    return `Expected address prefix '${chainAddressPrefix}' but got '${prefix}'`;
  }

  if (data.length !== 20) {
    return "Invalid address length in bech32 data. Must be 20 bytes.";
  }

  return null;
};

const checkProposalId = (input) => {
  if (!input) return "Empty";
  const n = parseInt(input, 10);

  if (isNaN(n)) {
    return "Expected an integer";
  }

  if (n < 0) {
    return "Expected a non-negative number";
  }

  return null;
};

/**
 * Returns a link to a transaction in an explorer if an explorer is configured
 * for transactions. Returns null otherwise.
 */
const explorerLinkTx = (link, hash) => {
  if (link && link.includes("${txHash}")) {
    return link.replace("${txHash}", hash);
  }
  return null;
};

export {
  abbreviateLongString,
  printableCoin,
  printableCoins,
  exampleAddress,
  examplePubkey,
  checkAddress,
  checkProposalId,
  explorerLinkTx,
};
