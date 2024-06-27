import { getMultisig } from "@/graphql/multisig";
import { createTransaction } from "@/graphql/transaction";
import { CreateDbTxBody } from "@/lib/api";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to create transaction";

export default async function apiCreateTransaction(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const body: CreateDbTxBody = req.body;

  try {
    const multisig = await getMultisig(body.chainId, body.creator);
    if (!multisig) {
      throw new Error(`multisig not found with address ${body.creator} on chain ${body.chainId}`);
    }

    const txId = await createTransaction({
      dataJSON: JSON.stringify(body.dataJSON),
      creator: { id: multisig.id },
    });

    res.status(200).send({ txId });
    console.log("Create transaction success", JSON.stringify({ txId }, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
