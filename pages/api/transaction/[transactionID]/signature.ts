import type { NextApiRequest, NextApiResponse } from "next";
import { createSignature } from "../../../../lib/graphqlHelpers";

export default async function transactionIDApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const transactionID = req.query.transactionID?.toString() || "";
        const data = req.body;
        console.log("Function `createSignature` invoked", data);
        const saveRes = await createSignature(data, transactionID);
        console.log("success", saveRes.data);
        res.status(200).send(saveRes.data.addSignature.signature[0]);
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
