import axios from "axios";
import { createMultisigThresholdPubkey, Pubkey, pubkeyToAddress } from "@cosmjs/amino";
import { Account } from "@cosmjs/stargate";
import { StargateClient } from "@cosmjs/stargate";

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
  compressedPubkeys: string[],
  threshold: number,
  addressPrefix: string,
  chainId: string,
): Promise<string> => {
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

/** Like Account but with non-optional pubkey */
export type AccountWithPubkey = Account & { readonly pubkey: Pubkey };

/**
 * This gets a multisigs account (pubkey, sequence, account number, etc) from
 * a node and/or the api if the multisig was made on this app
 *
 * @param {string} address The multisig address
 * @param client A connected stargate cosmoshub client
 * @return {object} The multisig account.
 */
const getMultisigAccount = async (
  address: string,
  client: StargateClient,
): Promise<AccountWithPubkey | null> => {
  // we need the multisig pubkeys to create transactions, if the multisig
  // is new, and has never submitted a transaction its pubkeys will not be
  // available from a node. If the multisig was created with this instance
  // of this tool its pubkey will be available in the fauna datastore
  const accountOnChain = await client.getAccount(address);
  const chainId = await client.getChainId();
  if (!accountOnChain) return null;

  let pubkey: Pubkey;
  if (accountOnChain.pubkey) {
    pubkey = accountOnChain.pubkey;
  } else {
    console.log("No pubkey on chain for: ", address);
    const res = await axios.get(`/api/chain/${chainId}/multisig/${address}`);

    if (res.status !== 200) {
      throw new Error("Multisig has no pubkey on node, and was not created using this tool.");
    }
    pubkey = JSON.parse(res.data.pubkeyJSON);
  }

  return {
    ...accountOnChain,
    pubkey: pubkey,
  };
};

export { createMultisigFromCompressedSecp256k1Pubkeys, getMultisigAccount };
