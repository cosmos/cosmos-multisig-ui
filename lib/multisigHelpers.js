import axios from "axios";
import { createMultisigThresholdPubkey, pubkeyToAddress } from "@cosmjs/amino";

/**
 * Turns array of compressed Secp256k1 pubkeys
 * into a multisig using comsjs
 *
 * @param {array} compressedPubkeys Must be an array of compressed Secp256k1 pubkeys (e.g 'A8B5KVhRz1oQuV1dguzFdGBhHrIU/I+R/QfBZcbZFWVG').
 * @param {number} threshold the number of signers required to sign messages from this multisig
 * @param {string} addressPrefix chain based prefix for the address (e.g. 'cosmos')
 * @param {string} chainId chain-id for the multisig (e.g. 'cosmoshub-4')
 * @return {string} The multisig address.
 */
const createMultisigFromCompressedSecp256k1Pubkeys = async (
  compressedPubkeys,
  threshold,
  addressPrefix,
  chainId,
) => {
  const pubkeys = compressedPubkeys.map((compressedPubkey) => {
    return {
      type: "tendermint/PubKeySecp256k1",
      value: compressedPubkey,
    };
  });
  const multisigPubkey = createMultisigThresholdPubkey(pubkeys, threshold);
  const multisigAddress = pubkeyToAddress(multisigPubkey, addressPrefix);

  // save multisig to fauna
  const multisig = {
    address: multisigAddress,
    pubkeyJSON: JSON.stringify(multisigPubkey),
    chainId,
  };

  const res = await axios.post(`/api/chain/${chainId}/multisig`, multisig);
  console.log(res.data);
  return res.data.address;
};

/**
 * This gets a multisigs account (pubkey, sequence, account number, etc) from
 * a node and/or the api if the multisig was made on this app
 *
 * @param {string} address The multisig address
 * @param client A connected stargate cosmoshub client
 * @return {object} The multisig account.
 */
const getMultisigAccount = async (address, client) => {
  // we need the multisig pubkeys to create transactions, if the multisig
  // is new, and has never submitted a transaction its pubkeys will not be
  // available from a node. If the multisig was created with this instance
  // of this tool its pubkey will be available in the fauna datastore
  let accountOnChain = await client.getAccount(address);
  const chainId = await client.getChainId();

  if (!accountOnChain || !accountOnChain.pubkey) {
    console.log("No pubkey on chain for: ", address);
    const res = await axios.get(`/api/chain/${chainId}/multisig/${address}`);

    if (res.status !== 200) {
      throw new Error("Multisig has no pubkey on node, and was not created using this tool.");
    }
    const pubkey = JSON.parse(res.data.pubkeyJSON);

    if (!accountOnChain) {
      accountOnChain = {};
    }
    accountOnChain.pubkey = pubkey;
  }
  return accountOnChain;
};

export { createMultisigFromCompressedSecp256k1Pubkeys, getMultisigAccount };
