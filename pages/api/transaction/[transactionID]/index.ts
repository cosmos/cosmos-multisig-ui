import { updateTxHash } from "@/graphql/transaction";
import { UpdateDbTxHashBody } from "@/lib/api";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to update txHash";

export default async function apiUpdateTxHash(req: NextApiRequest, res: NextApiResponse) {
  const txId = req.query.transactionID;

  if (req.method !== "POST" || typeof txId !== "string" || !txId) {
    res.status(405).end();
    return;
  }

  const body: UpdateDbTxHashBody = req.body;

  try {
    const dbTxHash = await updateTxHash(txId, body.txHash);
    res.status(200).send({ dbTxHash });
    console.log("Update txHash success", JSON.stringify({ dbTxHash }, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
