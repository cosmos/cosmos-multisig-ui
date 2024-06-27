import { gql } from "graphql-request";
import { z } from "zod";
import { gqlClient } from ".";

const DbNonceObjNonce = z.object({ nonce: z.number() });
type DbNonceObjNonce = Readonly<z.infer<typeof DbNonceObjNonce>>;

export const getNonce = async (chainId: string, address: string) => {
  type QueryResponse = { readonly queryNonce: readonly DbNonceObjNonce[] };
  type QueryVariables = { readonly chainId: string; readonly address: string };

  const { queryNonce } = await gqlClient.request<QueryResponse, QueryVariables>(
    gql`
      query GetNonce($chainId: String!, $address: String!) {
        queryNonce(filter: { chainId: { eq: $chainId }, address: { eq: $address } }) {
          nonce
        }
      }
    `,
    { chainId, address },
  );

  const dbNonceObj = queryNonce.length ? queryNonce[0] : null;

  if (dbNonceObj) {
    DbNonceObjNonce.parse(dbNonceObj);
    return dbNonceObj.nonce;
  }

  type AddResponse = { readonly addNonce: { readonly nonce: readonly DbNonceObjNonce[] } };
  type AddVariables = { readonly chainId: string; readonly address: string };

  const { addNonce } = await gqlClient.request<AddResponse, AddVariables>(
    gql`
      mutation CreateNonce($chainId: String!, $address: String!) {
        addNonce(input: { chainId: $chainId, address: $address, nonce: 1 }) {
          nonce {
            nonce
          }
        }
      }
    `,
    { chainId, address },
  );

  const createdNonceObj = addNonce.nonce[0];
  DbNonceObjNonce.parse(createdNonceObj);

  return createdNonceObj.nonce;
};

export const incrementNonce = async (chainId: string, address: string) => {
  const dbNonce = await getNonce(chainId, address);

  type Response = { readonly updateNonce: { readonly nonce: readonly DbNonceObjNonce[] } };
  type Variables = { readonly chainId: string; readonly address: string; readonly nonce: number };

  const { updateNonce } = await gqlClient.request<Response, Variables>(
    gql`
      mutation IncrementNonce($chainId: String!, $address: String!, $nonce: Int!) {
        updateNonce(
          input: {
            filter: { chainId: { eq: $chainId }, address: { eq: $address } }
            set: { nonce: $nonce }
          }
        ) {
          nonce {
            nonce
          }
        }
      }
    `,
    { chainId, address, nonce: dbNonce + 1 },
  );

  const updatedNonceObj = updateNonce.nonce[0];
  DbNonceObjNonce.parse(updatedNonceObj);

  return updatedNonceObj.nonce;
};
