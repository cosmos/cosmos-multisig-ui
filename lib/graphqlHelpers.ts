import { DbMultisig, DbNonce, DbSignature, DbTransaction, DbTransactionJsonObj } from "../types/db";
import { requestGraphQlJson } from "./request";

/**
 * Creates multisig record in dgraph
 *
 * @param {object} multisig an object with address (string), pubkey JSON and chainId
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
const createMultisig = async (multisig: DbMultisig) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation AddMultisig {
          addMultisig(
            input: {
              chainId: "${multisig.chainId}"
              address: "${multisig.address}"
              creator: "${multisig.creator}"
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
export interface MultisigFromQuery {
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
async function getMultisig(address: string, chainId: string): Promise<MultisigFromQuery | null> {
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

  const elements: readonly MultisigFromQuery[] = result.data.queryMultisig;
  return elements.length ? elements[0] : null;
}

/**
 * Gets multisig id from DB
 *
 * @param {string} address A multisig address.
 * @param {string} chainId The chainId the multisig belongs to.
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
async function getMultisigId(address: string, chainId: string): Promise<string | null> {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query MultisigsByAddressAndChainId {
          queryMultisig(filter: {address: {eq: "${address}"}, chainId: {eq: "${chainId}"}}) {
            id
          }
        }
      `,
    },
  });

  const elements: readonly (MultisigFromQuery & { id: string })[] = result.data.queryMultisig;
  return elements.length ? elements[0].id : null;
}

/**
 * Gets list of multisigs from DB
 *
 * @param {string} chainId The chainId the multisig belongs to.
 * @param {string} creator The address of the creator of the multisig.
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
async function getCreatedMultisigs(chainId: string, creator: string) {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query MultisigsByChainIdAndCreator {
          queryMultisig(filter: {chainId: {eq: "${chainId}"}, creator: {eq: "${creator}"}}) {
            address
            chainId
            pubkeyJSON
          }
        }
      `,
    },
  });

  const elements: readonly MultisigFromQuery[] = result.data.queryMultisig.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el: MultisigFromQuery | null, i: number, arr: any) =>
      el !== null && i === arr.findIndex((el2: MultisigFromQuery) => el2.address === el.address),
  );

  return elements;
}

/**
 * Gets list of multisigs from DB
 *
 * @param {string} chainId The chainId the multisig belongs to.
 * @param {string} creator The address of a member of the multisig.
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
async function getBelongedMultisigs(chainId: string, memberPubkey: string) {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query MultisigsByChainIdAndCreator {
          queryMultisig(filter: {chainId: {eq: "${chainId}"}, pubkeyJSON: {alloftext: "${memberPubkey}"}}) {
            address
            chainId
            pubkeyJSON
          }
        }
      `,
    },
  });

  const elements: readonly MultisigFromQuery[] = result.data.queryMultisig.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el: MultisigFromQuery | null, i: number, arr: any) =>
      el !== null && i === arr.findIndex((el2: MultisigFromQuery) => el2.address === el.address),
  );

  return elements;
}

/**
 * Creates transaction record in dgraph
 *
 * @param {object} transaction The base transaction
 * @return Returns async function that makes a request to the dgraph graphql endpoint
 */
const createTransaction = async (transaction: DbTransactionJsonObj, creator: string) => {
  return requestGraphQlJson({
    body: {
      query: `
        mutation AddTransaction {
          addTransaction(input: { dataJSON: ${JSON.stringify(
            transaction,
          )}, creator: {id: "${creator}"}}) {
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

const getTransactions = async (creator: string): Promise<readonly DbTransaction[]> => {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query GetTransactionsByCreator {
          getMultisig(id: "${creator}") {
            transactions {
              id
              txHash
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
    },
  });

  return result.data.getMultisig.transactions.reverse();
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

const nonceFromDbNonces = (dbNonces: readonly DbNonce[]): DbNonce | null => {
  const elements: readonly DbNonce[] = dbNonces.filter((el: DbNonce | null) => el !== null);
  const dbNonce = elements.length ? elements[0] : null;
  return dbNonce;
};

async function createNonce(chainId: string, address: string): Promise<DbNonce | null> {
  const result = await requestGraphQlJson({
    body: {
      query: `
        mutation AddNonce {
          addNonce(input: {chainId: "${chainId}", address: "${address}", nonce: 0}) {
            nonce {
              chainId
              address
              nonce
            }
          }
        }
      `,
    },
  });

  return nonceFromDbNonces(result.data.addNonce.nonce);
}

async function getNonce(chainId: string, address: string): Promise<DbNonce | null> {
  const result = await requestGraphQlJson({
    body: {
      query: `
        query NonceByChainIdAndAddress {
          queryNonce(filter: {chainId: {eq: "${chainId}"}, address: {eq: "${address}"}}) {
            chainId
            address
            nonce
          }
        }
      `,
    },
  });

  console.log({ result });

  return nonceFromDbNonces(result.data.queryNonce);
}

async function updateNonce(
  chainId: string,
  address: string,
  newNonce: number,
): Promise<DbNonce | null> {
  const result = await requestGraphQlJson({
    body: {
      query: `
        mutation UpdateNonce {
          updateNonce(input: {filter: {chainId: {eq: "${chainId}"}, address: {eq: "${address}"}}, set: {nonce: ${newNonce}}}) {
            nonce {
              chainId
              address
              nonce
            }
          }
        }
      `,
    },
  });

  return nonceFromDbNonces(result.data.updateNonce.nonce);
}

export {
  createMultisig,
  createNonce,
  createSignature,
  createTransaction,
  findTransactionByID,
  getBelongedMultisigs,
  getCreatedMultisigs,
  getMultisig,
  getMultisigId,
  getNonce,
  getTransactions,
  updateNonce,
  updateTxHash,
};
