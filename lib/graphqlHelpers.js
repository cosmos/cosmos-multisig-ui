import axios from "axios";

// Graphql base request for Faunadb
const graphqlReq = axios.create({
  baseURL: "https://graphql.fauna.com/graphql",
  headers: {
    Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
  },
});

/**
 * Creates multisig record in faunadb
 *
 * @param {object} multisig an object with address (string) and pubkey JSON
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const createMultisig = async (multisig) => {
  console.log(multisig);
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createMultisig(data: {
            address: "${multisig.address}"
            pubkeyJSON: ${JSON.stringify(multisig.pubkeyJSON)}
          }) {
            _id
            address
          }
        }
      `,
    },
  });
};

/**
 * Gets multisig pubkey from faundb
 *
 * @param {string} address Must be a multisig address.
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const getMultisig = async (address) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        query {
          getMultisig(address: "${address}") {
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
const createTransaction = async (transaction) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createTransaction(data: {dataJSON: ${JSON.stringify(transaction)}}) {
            _id
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
const findTransactionByID = async (id) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        query {
          findTransactionByID(id: "${id}") {
            _id
            dataJSON
            txHash
            signatures {
              data {
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
 * Updates txHash of transaction on FaunaDB
 *
 * @param {string} id Faunadb resource id
 * @param {string} txHash tx hash returned from broadcasting a tx
 * @return Returns async function that makes a request to the faunadb graphql endpoint
 */
const updateTxHash = async (id, txHash) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          updateTransaction(id: ${id}, data: {txHash: "${txHash}"}) {
            _id
            dataJSON
            txHash
            signatures {
              data {
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
const createSignature = async (signature, transactionId) => {
  return graphqlReq({
    method: "POST",
    data: {
      query: `
        mutation {
          createSignature(data: {
            transaction: {connect: ${transactionId}}, 
            bodyBytes: "${signature.bodyBytes}",
            signature: "${signature.signature}",
            address: "${signature.address}" 
          }) {
            _id
            address
            signature
            address
          }
        }
      `,
    },
  });
};

export {
  createMultisig,
  getMultisig,
  createTransaction,
  findTransactionByID,
  updateTxHash,
  createSignature,
};
