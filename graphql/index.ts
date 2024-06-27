import { GraphQLClient } from "graphql-request";

export const gqlClient = new GraphQLClient(
  process.env.DGRAPH_URL || "",
  process.env.DGRAPH_SECRET
    ? { headers: { authorization: process.env.DGRAPH_SECRET || "" } }
    : undefined,
);

export * from "./multisig";
export * from "./nonce";
export * from "./signature";
export * from "./transaction";
