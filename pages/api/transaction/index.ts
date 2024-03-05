import type { NextApiRequest, NextApiResponse } from "next";
import { createTransaction } from "../../../lib/graphqlHelpers";

export default async function transactionApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const data = req.body;
        console.log("Function `createTransaction` invoked", data);
        const createTransactionResult = await createTransaction(data.dataJSON);
        console.log("createTransactionResult:", createTransactionResult);
        res
          .status(200)
          .send({ transactionID: createTransactionResult.data.addTransaction.transaction[0].id });
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
