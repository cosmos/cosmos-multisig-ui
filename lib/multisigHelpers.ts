import {
  createMultisigThresholdPubkey,
  isMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from "@cosmjs/amino";
import { Account, StargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { checkAddress } from "./displayHelpers";
import { requestJson } from "./request";

interface CreateMultisigAccountResponse {
  readonly address: string;
}

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

  // save multisig to relational offchain database
  const multisig = {
    address: multisigAddress,
    pubkeyJSON: JSON.stringify(multisigPubkey),
    chainId,
  };

  const { address }: CreateMultisigAccountResponse = await requestJson(
    `/api/chain/${chainId}/multisig`,
    { body: multisig },
  );

  return address;
};

interface GetMultisigAccountResponse {
  readonly pubkeyJSON: string;
}

/**
 * This gets a multisigs account (pubkey, sequence, account number, etc) from
 * a node and/or the api if the multisig was made on this app.
 *
 * The public key should always be available, either on chain or in the app's database.
 * The account is only available when the there was any on-chain activity such as
 * receipt of tokens.
 */
const getMultisigAccount = async (
  address: string,
  addressPrefix: string,
  client: StargateClient,
): Promise<[MultisigThresholdPubkey, Account | null]> => {
  // we need the multisig pubkeys to create transactions, if the multisig
  // is new, and has never submitted a transaction its pubkeys will not be
  // available from a node. If the multisig was created with this instance
  // of this tool its pubkey will be available in the relational offchain database
  const addressError = checkAddress(address, addressPrefix);
  if (addressError) {
    throw new Error(addressError);
  }

  const accountOnChain = await client.getAccount(address);
  const chainId = await client.getChainId();

  let pubkey: MultisigThresholdPubkey;
  if (accountOnChain?.pubkey) {
    assert(
      isMultisigThresholdPubkey(accountOnChain.pubkey),
      "Pubkey on chain is not of type MultisigThreshold",
    );
    pubkey = accountOnChain.pubkey;
  } else {
    try {
      const { pubkeyJSON }: GetMultisigAccountResponse = await requestJson(
        `/api/chain/${chainId}/multisig/${address}`,
      );
      pubkey = JSON.parse(pubkeyJSON);
    } catch {
      throw new Error("Multisig has no pubkey on node, and was not created using this tool.");
    }
  }

  return [pubkey, accountOnChain];
};

export { createMultisigFromCompressedSecp256k1Pubkeys, getMultisigAccount };
