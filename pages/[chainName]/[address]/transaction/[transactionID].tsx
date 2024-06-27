import { isChainInfoFilled } from "@/context/ChainsContext/helpers";
import { DbSignatureObj } from "@/graphql";
import { getTransaction } from "@/graphql/transaction";
import { updateDbTxHash } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/utils";
import { MultisigThresholdPubkey } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Account, StargateClient, makeMultisignedTxBytes } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CompletedTransaction from "../../../../components/dataViews/CompletedTransaction";
import ThresholdInfo from "../../../../components/dataViews/ThresholdInfo";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";
import Button from "../../../../components/inputs/Button";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import { useChains } from "../../../../context/ChainsContext";
import { getHostedMultisig, isAccount } from "../../../../lib/multisigHelpers";
import { dbTxFromJson } from "../../../../lib/txMsgHelpers";

interface Props {
  props: {
    transactionJSON: string;
    transactionID: string;
    txHash: string;
    signatures: readonly DbSignatureObj[];
  };
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<Props> => {
  // get transaction info
  const transactionID = context.params?.transactionID?.toString();
  assert(transactionID, "Transaction ID missing");
  console.log("Function `findTransactionByID` invoked", transactionID);
  const tx = await getTransaction(transactionID);
  if (!tx) {
    throw new Error("Transaction not found");
  }
  console.log("success", tx);

  return {
    props: {
      transactionJSON: tx.dataJSON,
      txHash: tx.txHash || "",
      transactionID,
      signatures: tx.signatures ?? [],
    },
  };
};

const TransactionPage = ({
  transactionJSON,
  transactionID,
  signatures,
  txHash,
}: {
  transactionJSON: string;
  transactionID: string;
  signatures: DbSignatureObj[];
  txHash: string;
}) => {
  const { chain } = useChains();
  const [currentSignatures, setCurrentSignatures] = useState(signatures);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [transactionHash, setTransactionHash] = useState(txHash);
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [pubkey, setPubkey] = useState<MultisigThresholdPubkey>();
  const txInfo = dbTxFromJson(transactionJSON);
  const router = useRouter();
  const multisigAddress = router.query.address?.toString();

  const addSignature = (signature: DbSignatureObj) => {
    setCurrentSignatures((prevState: DbSignatureObj[]) => [...prevState, signature]);
  };

  useEffect(() => {
    (async function fetchMultisig() {
      try {
        if (!multisigAddress || !isChainInfoFilled(chain) || !chain.nodeAddress) {
          return;
        }

        const hostedMultisig = await getHostedMultisig(multisigAddress, chain);

        assert(
          hostedMultisig.hosted === "db+chain" && isAccount(hostedMultisig.accountOnChain),
          "Multisig address could not be found",
        );

        setPubkey(hostedMultisig.pubkeyOnDb);
        setAccountOnChain(hostedMultisig.accountOnChain);
      } catch (e) {
        console.error("Failed to find multisig address:", e);
        toastError({
          description: "Failed to find multisig address",
          fullError: e instanceof Error ? e : undefined,
        });
      }
    })();
  }, [chain, multisigAddress]);

  const broadcastTx = async () => {
    const loadingToastId = toast.loading("Broadcasting transaction");

    try {
      setIsBroadcasting(true);

      assert(accountOnChain, "Account on chain value missing.");
      assert(
        typeof accountOnChain.accountNumber === "number",
        "Account on chain is missing an accountNumber",
      );
      assert(pubkey, "Pubkey not found on chain or in database");
      assert(txInfo, "Transaction not found in database");
      const bodyBytes = fromBase64(currentSignatures[0].bodyBytes);
      const signedTxBytes = makeMultisignedTxBytes(
        pubkey,
        txInfo.sequence,
        txInfo.fee,
        bodyBytes,
        new Map(currentSignatures.map((s) => [s.address, fromBase64(s.signature)])),
      );

      const broadcaster = await StargateClient.connect(chain.nodeAddress);
      const result = await broadcaster.broadcastTx(signedTxBytes);
      await updateDbTxHash(transactionID, result.transactionHash);
      toastSuccess("Transaction broadcasted with hash", result.transactionHash);
      setTransactionHash(result.transactionHash);
    } catch (e) {
      console.error("Failed to broadcast tx:", e);
      toastError({
        description: "Failed to broadcast tx",
        fullError: e instanceof Error ? e : undefined,
      });
    } finally {
      setIsBroadcasting(false);
      toast.dismiss(loadingToastId);
    }
  };

  const isThresholdMet = pubkey
    ? currentSignatures.length >= Number(pubkey.value.threshold)
    : false;

  return (
    <Page
      goBack={
        chain.registryName
          ? {
              pathname: `/${chain.registryName}/${multisigAddress}`,
              title: "multisig",
            }
          : undefined
      }
    >
      <StackableContainer base>
        <StackableContainer>
          <h1>{transactionHash ? "Completed Transaction" : "In Progress Transaction"}</h1>
        </StackableContainer>
        {transactionHash ? <CompletedTransaction transactionHash={transactionHash} /> : null}
        {!transactionHash ? (
          <StackableContainer lessPadding lessMargin>
            {pubkey ? <ThresholdInfo signatures={currentSignatures} pubkey={pubkey} /> : null}
            {isThresholdMet ? (
              <>
                <Button
                  label={isBroadcasting ? "Broadcasting..." : "Broadcast Transaction"}
                  onClick={broadcastTx}
                  primary
                  disabled={isBroadcasting}
                />
              </>
            ) : null}
            {pubkey && txInfo ? (
              <TransactionSigning
                tx={txInfo}
                transactionID={transactionID}
                pubkey={pubkey}
                signatures={currentSignatures}
                addSignature={addSignature}
              />
            ) : null}
          </StackableContainer>
        ) : null}
        {txInfo ? <TransactionInfo tx={txInfo} /> : null}
      </StackableContainer>
    </Page>
  );
};

export default TransactionPage;
