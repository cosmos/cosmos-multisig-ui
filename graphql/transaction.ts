import { StdFee } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { gql } from "graphql-request";
import { z } from "zod";
import { DbMultisig, DbMultisigId, DbSignatureObj, gqlClient } from ".";

export const DbTransaction = z.object({
  id: z.string(),
  txHash: z.string().nullish(),
  creator: z.lazy(() => DbMultisig.nullish()),
  // When parsed with JSON.parse it's DbTransactionParsedDataJson
  dataJSON: z.string(),
  signatures: z.lazy(() => z.array(DbSignatureObj)),
});
export type DbTransaction = Readonly<z.infer<typeof DbTransaction>>;

export interface DbTransactionParsedDataJson {
  readonly accountNumber: number;
  readonly sequence: number;
  readonly chainId: string;
  readonly msgs: EncodeObject[];
  readonly fee: StdFee;
  readonly memo: string;
}

export type DbTransactionDraft = Pick<DbTransaction, "dataJSON"> & { creator: DbMultisigId };

export const DbTransactionId = DbTransaction.pick({ id: true });
export type DbTransactionId = Readonly<z.infer<typeof DbTransactionId>>;

export const getTransaction = async (id: string): Promise<DbTransaction | null> => {
  type Response = { readonly getTransaction: DbTransaction | null };
  type Variables = { readonly id: string };

  const { getTransaction: fetchedTx } = await gqlClient.request<Response, Variables>(
    gql`
      query GetTransaction($id: ID!) {
        getTransaction(id: $id) {
          id
          txHash
          creator {
            id
            chainId
            address
            creator
            pubkeyJSON
          }
          dataJSON
          signatures {
            bodyBytes
            signature
            address
          }
        }
      }
    `,
    { id },
  );

  if (!fetchedTx) {
    return null;
  }

  DbTransaction.parse(fetchedTx);

  return fetchedTx;
};

const DbMultisigTxs = z.object({ transactions: z.array(DbTransaction) });
type DbMultisigTxs = Readonly<z.infer<typeof DbMultisigTxs>>;

export const getTransactions = async (creatorId: string): Promise<readonly DbTransaction[]> => {
  type Response = { readonly getMultisig: DbMultisigTxs };
  type Variables = { readonly creatorId: string };

  const { getMultisig } = await gqlClient.request<Response, Variables>(
    gql`
      query GetTransactions($creatorId: ID!) {
        getMultisig(id: $creatorId) {
          transactions {
            id
            txHash
            creator {
              id
              chainId
              address
              creator
              pubkeyJSON
            }
            dataJSON
            signatures {
              bodyBytes
              signature
              address
            }
          }
        }
      }
    `,
    { creatorId },
  );

  const fetchedTxs: DbMultisigTxs = { transactions: getMultisig.transactions.reverse() };
  DbMultisigTxs.parse(fetchedTxs);

  return fetchedTxs.transactions;
};

export const createTransaction = async (transaction: DbTransactionDraft) => {
  type Response = { readonly addTransaction: { readonly transaction: readonly DbTransactionId[] } };
  type Variables = { readonly dataJSON: string; readonly creatorId: string };

  const { addTransaction } = await gqlClient.request<Response, Variables>(
    gql`
      mutation CreateTransaction($dataJSON: String!, $creatorId: ID!) {
        addTransaction(input: { dataJSON: $dataJSON, creator: { id: $creatorId } }) {
          transaction {
            id
          }
        }
      }
    `,
    { ...transaction, creatorId: transaction.creator.id },
  );

  const createdTx = addTransaction.transaction[0];
  DbTransactionId.parse(createdTx);

  return createdTx.id;
};

const DbTransactionTxHash = z.object({ txHash: z.string() });
type DbTransactionTxHash = Readonly<z.infer<typeof DbTransactionTxHash>>;

export const updateTxHash = async (id: string, txHash: string) => {
  type Response = {
    readonly updateTransaction: { readonly transaction: readonly DbTransactionTxHash[] };
  };
  type Variables = { readonly id: string; readonly txHash: string };

  const { updateTransaction } = await gqlClient.request<Response, Variables>(
    gql`
      mutation UpdateTxHash($id: [ID!], $txHash: String!) {
        updateTransaction(input: { filter: { id: $id }, set: { txHash: $txHash } }) {
          transaction {
            txHash
          }
        }
      }
    `,
    { id, txHash },
  );

  const updatedTx = updateTransaction.transaction[0];
  DbTransactionTxHash.parse(updatedTx);

  return updatedTx.txHash;
};
