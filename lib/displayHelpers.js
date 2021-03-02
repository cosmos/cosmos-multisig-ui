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

export { abbreviateLongString };
