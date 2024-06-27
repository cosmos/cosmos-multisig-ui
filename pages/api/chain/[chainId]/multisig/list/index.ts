import { getBelongedMultisigs, getCreatedMultisigs } from "@/graphql/multisig";
import { getNonce, incrementNonce } from "@/graphql/nonce";
import { GetDbMultisigTxsBody } from "@/lib/api";
import { verifyKeplrSignature } from "@/lib/keplr";
import { decodeSignature, pubkeyToAddress } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { StargateClient } from "@cosmjs/stargate";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to list multisigs";

export default async function apiListMultisigs(req: NextApiRequest, res: NextApiResponse) {
  const chainId = req.query.chainId;

  if (req.method !== "POST" || typeof chainId !== "string" || !chainId) {
    res.status(405).end();
    return;
  }

  const body: GetDbMultisigTxsBody = req.body;

  try {
    if (chainId !== body.chain.chainId) {
      throw new Error(
        `tried listing multisigs from ${chainId} with data from ${body.chain.chainId}`,
      );
    }

    const address = pubkeyToAddress(body.signature.pub_key, body.chain.addressPrefix);

    const client = await StargateClient.connect(body.chain.nodeAddress);
    const accountOnChain = await client.getAccount(address);

    if (!accountOnChain) {
      throw new Error(`account with address ${address} not found on chain ${chainId}`);
    }

    const dbNonce = await getNonce(chainId, address);
    const incrementedNonce = await incrementNonce(chainId, address);

    if (incrementedNonce !== dbNonce + 1) {
      throw new Error("nonce increment failed");
    }

    const verified = verifyKeplrSignature(body.signature, body.chain, dbNonce);

    if (verified) {
      const created = await getCreatedMultisigs(chainId, address);
      const { pubkey: decodedPubKey } = decodeSignature(body.signature);
      const belonged = await getBelongedMultisigs(chainId, toBase64(decodedPubKey));

      res.status(200).send({ created, belonged });
      console.log("List multisigs success", JSON.stringify({ created, belonged }, null, 2));
    } else {
      throw new Error("signature verification failed");
    }
  } catch (err: unknown) {
    console.error(err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
