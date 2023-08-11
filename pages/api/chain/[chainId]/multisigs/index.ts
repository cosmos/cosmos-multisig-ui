import { decodeSignature } from "@cosmjs/amino";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { StdSignature } from "@keplr-wallet/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function multisigsApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const { signature }: { signature: StdSignature } = JSON.parse(req.body);

        const memberAddress = typeof req.query.address === "string" ? req.query.address : "";
        const chainId = typeof req.query.chainId === "string" ? req.query.chainId : "";

        const member = await getUser(memberAddress, chainId);
        const { pubkey: decodedPubKey, signature: decodedSignature } = decodeSignature(signature);
        const data = JSON.stringify({
          title: `Keplr Login to ${chainId}`,
          description: "Sign this no fee transaction to login with your Keplr wallet",
          nonce: member.nonce,
        });

        updateNonce(memberAddress, chainId);

        const { addressPrefix } = await getChainInfo(chainId);

        const verified = verifyADR36Amino(
          addressPrefix,
          memberAddress,
          data,
          decodedPubKey,
          decodedSignature,
        );

        if (verified) {
          const multisigsRes = await getMultisigs(memberAddress, chainId);
          if (!multisigsRes.data.getMultisigs) {
            res.status(404).send("Multisigs not found");
            return;
          }
          console.log("success", multisigsRes.data.getMultisigs);
          res.status(200).send(multisigsRes.data.getMultisigs);
          return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
      } catch (err: any) {
        console.log(err);
        res.status(400).send(err.message);
        return;
      }
      // no route matched
      res.status(405).end();
      return;
  }
}
