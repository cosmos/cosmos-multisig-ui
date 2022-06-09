import { createTransaction } from "../../../lib/graphqlHelpers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const data = req.body;
        console.log("Function `createTransaction` invoked", data);
        const saveRes = await createTransaction(data.dataJSON);
        console.log("success", saveRes.data);
        res.status(200).send({ transactionID: saveRes.data.data.createTransaction._id });
        return;
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
