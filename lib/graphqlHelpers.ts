import { DbAccount, DbSignature, DbTransaction } from "../types";
import { requestGraphQlJson } from "./request";

/**
 * Creates multisig record in faunadb
 *
 * @param {object} multisig an object with address (string), pubkey JSON and chainId
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createMultisig = async (multisig: DbAccount) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation AddMultisig {
          addMultisig(
            input: {
              chainId: "${multisig.chainId}"
              address: "${multisig.address}"
              pubkeyJSON: ${JSON.stringify(multisig.pubkeyJSON)}
            }
          ) {
            multisig {
              id
              chainId
              address
            }
          }
        }
      `,
    },
  });
};

/**
 * Gets multisig pubkey from faundb
 *
 * @param {string} address A multisig address.
 * @param {string} chainId The chainId the multisig belongs to.
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const getMultisig = async (address: string, chainId: string) => {
  return requestGraphQlJson({
    body: {
      query: `
        query GetMultisig {
          getMultisig(chainId: "${chainId}", address: "${address}") {
            chainId
            address
            pubkeyJSON
          }
        }
      `,
    },
  });
};

/**
 * Creates transaction record in faunadb
 *
 * @param {object} transaction The base transaction
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createTransaction = async (transaction: DbTransaction) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation AddTransaction {
          addTransaction(input: { dataJSON: ${JSON.stringify(transaction)} }) {
            transaction {
              id
            }
          }
        }
      `,
    },
  });
};

/**
 * Retrieves a transaction from faunadb
 *
 * @param {string} id Faunadb resource id
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const findTransactionByID = async (id: string) => {
  return requestGraphQlJson({
    body: {
      query: `
        query GetTransaction {
          getTransaction(id: "${id}") {
            dataJSON
            txHash
            signatures {
              address
              signature
              bodyBytes
            }
          }
        }
      `,
    },
  });
};

/**
 * Updates txHash of transaction on FaunaDB
 *
 * @param {string} id Faunadb resource id
 * @param {string} txHash tx hash returned from broadcasting a tx
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const updateTxHash = async (id: string, txHash: string) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation UpdateTransaction {
          updateTransaction(
            input: { filter: { id: "${id}" }, set: { txHash: "${txHash}" } }
          ) {
            transaction {
              id
              dataJSON
              txHash
              signatures {
                address
                signature
                bodyBytes
              }
            }
          }
        }
      `,
    },
  });
};

/**
 * Creates signature record in faunadb
 *
 * @param {object} signature an object with bodyBytes (string) and signature set (Uint8 Array)
 * @param {string} transactionId id of the transaction to relate the signature with
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createSignature = async (signature: DbSignature, transactionId: string) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation AddSignature {
          addSignature(
            input: {
              transaction: { id: "${transactionId}" }
              address: "${signature.address}"
              signature: "${signature.signature}"
              bodyBytes: "${signature.bodyBytes}"
            }
          ) {
            signature {
              transaction {
                id
              }
              signature
            }
          }
        }
      `,
    },
  });
};

export {
  createMultisig,
  createSignature,
  createTransaction,
  findTransactionByID,
  getMultisig,
  updateTxHash,
};
