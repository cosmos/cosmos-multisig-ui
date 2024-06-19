import { ChainInfo } from "@/context/ChainsContext/types";
import {
  getMultisig,
  getMultisigId,
  getNonce,
  getTransactions,
  updateNonce,
} from "@/lib/graphqlHelpers";
import { verifyKeplrSignature } from "@/lib/keplr";
import { decodeSignature, pubkeyToAddress } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { StargateClient } from "@cosmjs/stargate";
import { StdSignature } from "@keplr-wallet/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function transactionsApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const {
          signature,
          chain,
          multisigAddress,
        }: { signature: StdSignature; chain: ChainInfo; multisigAddress: string } = req.body;

        const multisig = await getMultisig(multisigAddress, chain.chainId);
        if (!multisig) {
          throw new Error("Multisig not found");
        }

        const { pubkey: decodedPubKey } = decodeSignature(signature);

        if (!multisig.pubkeyJSON.includes(toBase64(decodedPubKey))) {
          throw new Error("You don't belong to the multisig");
        }

        const address = pubkeyToAddress(signature.pub_key, chain.addressPrefix);

        const client = await StargateClient.connect(chain.nodeAddress);
        const accountOnChain = await client.getAccount(address);

        if (!accountOnChain) {
          throw new Error("Account not found on chain for: " + address);
        }

        const dbNonce = await getNonce(chain.chainId, address);

        if (!dbNonce) {
          throw new Error(`Nonce not found on ${chain.chainId} for ${address}`);
        }

        await updateNonce(chain.chainId, address, dbNonce.nonce + 1);
        const verified = verifyKeplrSignature(signature, chain, dbNonce.nonce);

        if (verified) {
          const multisigId = await getMultisigId(multisigAddress, chain.chainId);
          if (!multisigId) {
            throw new Error("Multisig not found");
          }
          console.log("Function `getTransactions` invoked", chain.chainId, address);
          const transactions = await getTransactions(multisigId);
          console.log("success", transactions);
          res.status(200).send(transactions);
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
