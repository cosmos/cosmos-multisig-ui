import type { NextApiRequest, NextApiResponse } from "next";
import { updateTxHash } from "../../../../lib/graphqlHelpers";

export default async function transactionIDApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const transactionID = req.query.transactionID?.toString() || "";
        const { txHash } = req.body;
        console.log("Function `updateTransaction` invoked", txHash);
        const saveRes = await updateTxHash(transactionID, txHash);
        console.log("success", saveRes.data);
        res.status(200).send(saveRes.data.updateTransaction.transaction[0]);
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
