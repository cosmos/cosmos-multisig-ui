import { ChainInfo } from "@/context/ChainsContext/types";
import {
  getBelongedMultisigs,
  getCreatedMultisigs,
  getNonce,
  updateNonce,
} from "@/lib/graphqlHelpers";
import { decodeSignature, pubkeyToAddress } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { StargateClient } from "@cosmjs/stargate";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { StdSignature } from "@keplr-wallet/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function multisigsApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const { signature, chain }: { signature: StdSignature; chain: ChainInfo } = req.body;

        const chainId = typeof req.query.chainId === "string" ? req.query.chainId : "";
        if (chainId !== chain.chainId) {
          throw new Error(`Tried connecting to ${chainId} with data from ${chain.chainId}`);
        }

        const address = pubkeyToAddress(signature.pub_key, chain.addressPrefix);

        const client = await StargateClient.connect(chain.nodeAddress);
        const accountOnChain = await client.getAccount(address);

        if (!accountOnChain) {
          throw new Error("Account not found on chain for: " + address);
        }

        const dbNonce = await getNonce(chainId, address);

        if (!dbNonce) {
          throw new Error(`Nonce not found on ${chainId} for ${address}`);
        }

        const { pubkey: decodedPubKey, signature: decodedSignature } = decodeSignature(signature);
        const data = JSON.stringify({
          title: `Keplr Login to ${chain.chainDisplayName}`,
          description: "Sign this no fee transaction to login with your Keplr wallet",
          nonce: dbNonce.nonce,
        });

        await updateNonce(chainId, address, dbNonce.nonce + 1);

        const verified = verifyADR36Amino(
          chain.addressPrefix,
          address,
          data,
          decodedPubKey,
          decodedSignature,
        );

        if (verified) {
          console.log("Function `getMultisigs` invoked", chainId, address);
          const created = await getCreatedMultisigs(chainId, address);
          const belonged = await getBelongedMultisigs(chainId, toBase64(decodedPubKey));
          console.log("success", { created, belonged });
          res.status(200).send({ created, belonged });
          return;
        }

        throw new Error("Signature failed for querying multisigs");
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
