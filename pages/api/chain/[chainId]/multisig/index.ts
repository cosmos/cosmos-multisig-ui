import type { NextApiRequest, NextApiResponse } from "next";
import { createMultisig } from "../../../../../lib/graphqlHelpers";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const data = req.body;
        console.log("Function `createMultisig` invoked", data);
        const saveRes = await createMultisig(data);
        console.log("success", saveRes.data);
        res.status(200).send(saveRes.data.data.createMultisig);
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
