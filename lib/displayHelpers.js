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

// Takes a Coin (e.g. `{"amount": "1234", "denom": "uatom"}`) and converts it
// into a user-readable string.
//
// A leading "u" is interpreted as µ (micro) and uxyz will be converted to XYZ
// for displaying.
const printableCoin = (coin) => {
  if (coin.denom?.startsWith("u")) {
    const ticker = coin.denom.slice(1).toUpperCase();
    return Decimal.fromAtomics(coin.amount ?? "0", 6).toString() + thinSpace + ticker;
  } else {
    return coin.amount + thinSpace + coin.denom;
  }
}

export { abbreviateLongString, printableCoin };
