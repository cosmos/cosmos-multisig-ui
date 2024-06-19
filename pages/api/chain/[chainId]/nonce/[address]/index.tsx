import { createNonce, getNonce } from "@/lib/graphqlHelpers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function nonceApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const chainId = req.query.chainId?.toString() || "";
        const address = req.query.address?.toString() || "";

        console.log("Function `getNonce` invoked", chainId, address);
        let nonce = await getNonce(chainId, address);
        if (nonce) {
          console.log("success", nonce);
          res.status(200).send(nonce);
          return;
        }

        nonce = await createNonce(chainId, address);
        if (!nonce) {
          throw new Error(`Nonce could not be created on ${chainId} for ${address}`);
        }

        console.log("success", nonce);
        res.status(200).send(nonce);
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        res.status(400).send(err.message);
        return;
      }
  }
  // no route matched
  res.status(405).end();
  return;
}
