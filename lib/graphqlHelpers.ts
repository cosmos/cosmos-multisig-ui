import { DbAccount, DbSignature, DbTransaction } from "../types";
import { requestGraphQlJson } from "./request";

/**
 * Creates multisig record in dgraph
 *
 * @param {object} multisig an object with address (string), pubkey JSON and chainId
 * @return Returns async function that makes a request to the dgraph graphql endpoint
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
 * This is the format returned by the graphQL API.
 *
 * Keep the format in sync with `GetMultisigAccountResponse` because
 * we return the full object in the API. Right now address and chainId
 * are somewhat unnecessary to query but still nice for debgging.
 */
interface MultisigFromQuery {
  address: string;
  chainId: string;
  pubkeyJSON: string;
}

/**
 * Gets multisig pubkey from DB
 *
 * @param {string} address A multisig address.
 * @param {string} chainId The chainId the multisig belongs to.
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
async function getMultisig(
  address: string,
  chainId: string,
): Promise<MultisigFromQuery | undefined> {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query MultisigsByAddressAndChainId {
          queryMultisig(filter: {address: {eq: "${address}"}, chainId: {eq: "${chainId}"}}) {
            address
            chainId
            pubkeyJSON
          }
        }
      `,
    },
  });
  const elements: [MultisigFromQuery] = result.data.queryMultisig;
  const first = elements.find(() => true);
  return first;
}

/**
 * Creates transaction record in dgraph
 *
 * @param {object} transaction The base transaction
 * @return Returns async function that makes a request to the dgraph graphql endpoint
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
 * Retrieves a transaction from dgraph
 *
 * @param {string} id dgraph resource id
 * @return Returns async function that makes a request to the dgraph graphql endpoint
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
 * Updates txHash of transaction on dgraph
 *
 * @param {string} id dgraph resource id
 * @param {string} txHash tx hash returned from broadcasting a tx
 * @return Returns async function that makes a request to the dgraph graphql endpoint
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
 * Creates signature record in dgraph
 *
 * @param {object} signature an object with bodyBytes (string) and signature set (Uint8 Array)
 * @param {string} transactionId id of the transaction to relate the signature with
 * @return Returns async function that makes a request to the dgraph graphql endpoint
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
