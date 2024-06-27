import { gql } from "graphql-request";
import { z } from "zod";
import { DbTransactionId, gqlClient } from ".";

// Calling DbSignatureObj to avoid DbSignatureSignature for the field type
export const DbSignatureObj = z.object({
  bodyBytes: z.string(),
  signature: z.string(),
  address: z.string(),
});
export type DbSignatureObj = Readonly<z.infer<typeof DbSignatureObj>>;

export type DbSignatureObjDraft = DbSignatureObj & { readonly transaction: DbTransactionId };

const DbSignatureObjSignature = DbSignatureObj.pick({ signature: true });
type DbSignatureObjSignature = Readonly<z.infer<typeof DbSignatureObjSignature>>;

export const createSignature = async (signature: DbSignatureObjDraft) => {
  type Response = {
    readonly addSignature: { readonly signature: readonly { readonly signature: string }[] };
  };
  type Variables = Omit<DbSignatureObjDraft, "transaction"> & { readonly transactionId: string };

  const { addSignature } = await gqlClient.request<Response, Variables>(
    gql`
      mutation CreateSignature(
        $transactionId: ID!
        $bodyBytes: String!
        $signature: String!
        $address: String!
      ) {
        addSignature(
          input: {
            transaction: { id: $transactionId }
            bodyBytes: $bodyBytes
            signature: $signature
            address: $address
          }
        ) {
          signature {
            signature
          }
        }
      }
    `,
    { ...signature, transactionId: signature.transaction.id },
  );

  const signatureObjSignature = addSignature.signature[0];
  DbSignatureObjSignature.parse(signatureObjSignature);

  return signatureObjSignature.signature;
};
