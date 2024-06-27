import { ChainInfo } from "@/context/ChainsContext/types";
import {
  DbMultisig,
  DbMultisigDraft,
  DbSignatureObjDraft,
  DbTransaction,
  DbTransactionParsedDataJson,
} from "@/graphql";
import { StdSignature } from "@cosmjs/amino";
import { requestJson } from "./request";

export const getDbMultisig = async (multisigAddress: string, chainId: string) => {
  const multisig: DbMultisig = await requestJson(
    `/api/chain/${chainId}/multisig/${multisigAddress}`,
  );

  return multisig;
};

export type GetDbUserMultisigsBody = {
  readonly signature: StdSignature;
  readonly chain: ChainInfo;
};
export type FetchedMultisigs = {
  readonly created: readonly DbMultisig[];
  readonly belonged: readonly DbMultisig[];
};
export const getDbUserMultisigs = async (signature: StdSignature, chain: ChainInfo) => {
  const body: GetDbUserMultisigsBody = { signature, chain };

  const multisigs: FetchedMultisigs = await requestJson(
    `/api/chain/${chain.chainId}/multisig/list`,
    { body },
  );

  return multisigs;
};

export type CreateDbMultisigBody = DbMultisigDraft;
export const createDbMultisig = async (multisig: DbMultisigDraft, chainId: string) => {
  const body: CreateDbMultisigBody = multisig;

  const { dbMultisigAddress }: { dbMultisigAddress: string } = await requestJson(
    `/api/chain/${chainId}/multisig`,
    { body },
  );

  return dbMultisigAddress;
};

export type GetDbMultisigTxsBody = {
  readonly signature: StdSignature;
  readonly chain: ChainInfo;
  readonly multisigAddress: string;
};
export const getDbMultisigTxs = async (
  multisigAddress: string,
  chain: ChainInfo,
  signature: StdSignature,
) => {
  const body: GetDbMultisigTxsBody = { signature, chain, multisigAddress };
  const txs: readonly DbTransaction[] = await requestJson(`/api/transaction/list`, { body });

  return txs;
};

export type CreateDbTxBody = {
  readonly dataJSON: DbTransactionParsedDataJson;
  readonly creator: string;
  readonly chainId: string;
};
export const createDbTx = async (
  creatorAddress: string,
  chainId: string,
  dataJSON: DbTransactionParsedDataJson,
) => {
  const body: CreateDbTxBody = { dataJSON, creator: creatorAddress, chainId };
  const { txId }: { txId: string } = await requestJson("/api/transaction", { body });

  return txId;
};

export type UpdateDbTxHashBody = {
  readonly txHash: string;
};
export const updateDbTxHash = async (txId: string, txHash: string) => {
  const body: UpdateDbTxHashBody = { txHash };

  const { dbTxHash }: { dbTxHash: string } = await requestJson(`/api/transaction/${txId}`, {
    body,
  });

  return dbTxHash;
};

export type CreateDbSignatureBody = Omit<DbSignatureObjDraft, "transaction">;
export const createDbSignature = async (
  txId: string,
  signatureObj: Omit<DbSignatureObjDraft, "transaction">,
) => {
  const body: CreateDbSignatureBody = signatureObj;

  const { signature }: { signature: string } = await requestJson(
    `/api/transaction/${txId}/signature`,
    { body },
  );

  return signature;
};

export const getDbNonce = async (address: string, chainId: string) => {
  const { nonce }: { nonce: number } = await requestJson(`/api/chain/${chainId}/nonce/${address}`);
  return nonce;
};
