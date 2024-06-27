import { getMultisig } from "@/graphql/multisig";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to get multisig";

export default async function apiGetMultisig(req: NextApiRequest, res: NextApiResponse) {
  const chainId = req.query.chainId;
  const multisigAddress = req.query.multisigAddress;

  if (
    req.method !== "GET" ||
    typeof chainId !== "string" ||
    !chainId ||
    typeof multisigAddress !== "string" ||
    !multisigAddress
  ) {
    res.status(405).end();
    return;
  }

  try {
    const multisig = await getMultisig(chainId, multisigAddress);
    if (!multisig) {
      throw new Error(`multisig not found with address ${multisigAddress} on chain ${chainId}`);
    }

    res.status(200).send(multisig);
    console.log("Get multisig success", JSON.stringify(multisig, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
