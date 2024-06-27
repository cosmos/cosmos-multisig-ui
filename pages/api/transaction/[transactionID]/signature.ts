import { DbSignatureObjDraft, createSignature } from "@/graphql/signature";
import { CreateDbSignatureBody } from "@/lib/api";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to create signature";

export default async function apiCreateSignature(req: NextApiRequest, res: NextApiResponse) {
  const txId = req.query.transactionID;

  if (req.method !== "POST" || typeof txId !== "string" || !txId) {
    res.status(405).end();
    return;
  }

  const body: CreateDbSignatureBody = req.body;

  try {
    const signatureObjDraft: DbSignatureObjDraft = { ...body, transaction: { id: txId } };
    const signature = await createSignature(signatureObjDraft);
    res.status(200).send({ signature });
    console.log("Create signature success", JSON.stringify({ signature }, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
