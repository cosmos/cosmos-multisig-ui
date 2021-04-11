import { createMultisigThresholdPubkey, pubkeyToAddress } from "@cosmjs/amino";

/**
 * Turns array of compressed Secp256k1 pubkeys
 * into a multisig using comsjs
 *
 * @param {array} compressedPubkeys Must be an array of compressed Secp256k1 pubkeys (e.g 'A8B5KVhRz1oQuV1dguzFdGBhHrIU/I+R/QfBZcbZFWVG').
 * @param {number} threshold the number of signers required to sign messages from this multisig
 * @return {string} The multisig address.
 */
const createMultisigFromCompressedSecp256k1Pubkeys = (
  compressedPubkeys,
  threshold
) => {
  let pubkeys = compressedPubkeys.map((compressedPubkey) => {
    return {
      type: "tendermint/PubKeySecp256k1",
      value: compressedPubkey,
    };
  });

  const multisig = createMultisigThresholdPubkey(pubkeys, threshold);
  const multisigAddress = pubkeyToAddress(multisig, "cosmos");
  return multisigAddress;
};

export { createMultisigFromCompressedSecp256k1Pubkeys };
