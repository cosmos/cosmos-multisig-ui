import { getMultisig } from "@/graphql/multisig";
import { getNonce, incrementNonce } from "@/graphql/nonce";
import { getTransactions } from "@/graphql/transaction";
import { GetDbMultisigTxsBody } from "@/lib/api";
import { verifyKeplrSignature } from "@/lib/keplr";
import { decodeSignature, pubkeyToAddress } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { StargateClient } from "@cosmjs/stargate";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to list transactions";

export default async function apiListTransactions(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const body: GetDbMultisigTxsBody = req.body;

  try {
    const multisig = await getMultisig(body.chain.chainId, body.multisigAddress);
    if (!multisig) {
      throw new Error(
        `multisig not found with address ${body.multisigAddress} on chain ${body.chain.chainId}`,
      );
    }

    const { pubkey: decodedPubKey } = decodeSignature(body.signature);

    if (!multisig.pubkeyJSON.includes(toBase64(decodedPubKey))) {
      throw new Error("your account does not belong to the multisig");
    }

    const address = pubkeyToAddress(body.signature.pub_key, body.chain.addressPrefix);

    const client = await StargateClient.connect(body.chain.nodeAddress);
    const accountOnChain = await client.getAccount(address);

    if (!accountOnChain) {
      throw new Error(`account with address ${address} not found on chain ${body.chain.chainId}`);
    }

    const dbNonce = await getNonce(body.chain.chainId, address);
    const incrementedNonce = await incrementNonce(body.chain.chainId, address);

    if (incrementedNonce !== dbNonce + 1) {
      throw new Error("nonce increment failed");
    }

    const verified = verifyKeplrSignature(body.signature, body.chain, dbNonce);

    if (verified) {
      const transactions = await getTransactions(multisig.id);
      res.status(200).send(transactions);
      console.log("List transactions success", JSON.stringify(transactions, null, 2));
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
