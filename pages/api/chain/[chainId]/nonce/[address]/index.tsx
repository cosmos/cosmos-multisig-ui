import { getNonce } from "@/graphql/nonce";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to get nonce";

export default async function apiGetNonce(req: NextApiRequest, res: NextApiResponse) {
  const chainId = req.query.chainId;
  const address = req.query.address;

  if (
    req.method !== "GET" ||
    typeof chainId !== "string" ||
    !chainId ||
    typeof address !== "string" ||
    !address
  ) {
    res.status(405).end();
    return;
  }

  try {
    const nonce = await getNonce(chainId, address);
    res.status(200).send({ nonce });
    console.log("Get nonce success", JSON.stringify({ nonce }, null, 2));
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
