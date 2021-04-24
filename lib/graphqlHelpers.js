import axios from "axios";

// Graphql base request for Faunadb
const graphqlReq = axios;
graphqlReq.defaults.baseURL = "https://graphql.fauna.com/graphql";
graphqlReq.defaults.headers.common = {
  Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
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
            dataJSON
            signatures {
              data {
                dataJSON
              }
            }
          }
        }
      `,
    },
  });
};

export { getMultisig, createTransaction, findTransactionByID };
