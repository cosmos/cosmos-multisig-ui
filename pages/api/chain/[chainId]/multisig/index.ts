import { createMultisig } from "@/graphql/multisig";
import { CreateDbMultisigBody } from "@/lib/api";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to create multisig";

export default async function apiCreateMultisig(req: NextApiRequest, res: NextApiResponse) {
  const chainId = req.query.chainId;

  if (req.method !== "POST" || typeof chainId !== "string" || !chainId) {
    res.status(405).end();
    return;
  }

  const multisigDraft: CreateDbMultisigBody = req.body;

  try {
    if (chainId !== multisigDraft.chainId) {
      throw new Error(
        `tried to create multisig on chain ${chainId} with data for chain ${multisigDraft.chainId}`,
      );
    }

    const dbMultisigAddress = await createMultisig(multisigDraft);
    res.status(200).send({ dbMultisigAddress });
    console.log("Create multisig success", JSON.stringify({ dbMultisigAddress }, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
