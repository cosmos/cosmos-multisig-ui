import { ChainInfo } from "@/context/ChainsContext/types";
import { DbMultisigDraft } from "@/graphql";
import {
  MultisigThresholdPubkey,
  createMultisigThresholdPubkey,
  pubkeyToAddress,
} from "@cosmjs/amino";
import { Account, StargateClient } from "@cosmjs/stargate";
import { createDbMultisig, getDbMultisig } from "./api";
import { checkAddress, explorerLinkAccount } from "./displayHelpers";

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
export const createMultisigFromCompressedSecp256k1Pubkeys = async (
  compressedPubkeys: string[],
  threshold: number,
  addressPrefix: string,
  chainId: string,
  creator: string,
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
  const multisig: DbMultisigDraft = {
    address: multisigAddress,
    pubkeyJSON: JSON.stringify(multisigPubkey),
    creator,
    chainId,
  };

  const dbMultisigAddress = await createDbMultisig(multisig, chainId);

  return dbMultisigAddress;
};

export type HostedMultisig =
  | {
      readonly hosted: "nowhere";
    }
  | {
      readonly hosted: "db";
      readonly pubkeyOnDb: MultisigThresholdPubkey;
    }
  | {
      readonly hosted: "chain";
      readonly accountOnChain: Partial<Account> | null;
      readonly explorerLink: string | null;
    }
  | {
      readonly hosted: "db+chain";
      readonly pubkeyOnDb: MultisigThresholdPubkey;
      readonly accountOnChain: Partial<Account> | null;
      readonly explorerLink: string | null;
    };

export const getHostedMultisig = async (
  multisigAddress: string,
  { addressPrefix, chainId, nodeAddress, explorerLinks }: ChainInfo,
  providedClient?: StargateClient,
): Promise<HostedMultisig> => {
  const addressError = checkAddress(multisigAddress, addressPrefix);
  if (addressError) {
    throw new Error(addressError);
  }

  let hostedMultisig: HostedMultisig = { hosted: "nowhere" };

  hostedMultisig = await (async () => {
    try {
      const { pubkeyJSON } = await getDbMultisig(multisigAddress, chainId);

      const pubkeyOnDb = JSON.parse(pubkeyJSON);
      return { hosted: "db", pubkeyOnDb };
    } catch {
      return hostedMultisig;
    }
  })();

  hostedMultisig = await (async () => {
    try {
      const client = providedClient ?? (await StargateClient.connect(nodeAddress));
      const accountOnChain = await client.getAccount(multisigAddress);

      if (!accountOnChain) {
        return hostedMultisig;
      }

      const explorerLink = explorerLinkAccount(explorerLinks.account, multisigAddress);

      if (hostedMultisig.hosted === "db") {
        return {
          hosted: "db+chain",
          pubkeyOnDb: hostedMultisig.pubkeyOnDb,
          accountOnChain,
          explorerLink,
        };
      }

      return { hosted: "chain", accountOnChain, explorerLink };
    } catch {
      return hostedMultisig;
    }
  })();

  return hostedMultisig;
};

export const isAccount = (account: Partial<Account> | null): account is Account =>
  Boolean(
    account?.address &&
      typeof account.accountNumber === "number" &&
      typeof account.sequence === "number",
  );
