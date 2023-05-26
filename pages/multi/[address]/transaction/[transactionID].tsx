import { MultisigThresholdPubkey } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Account, StargateClient, makeMultisignedTxBytes } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import CompletedTransaction from "../../../../components/dataViews/CompletedTransaction";
import ThresholdInfo from "../../../../components/dataViews/ThresholdInfo";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";
import Button from "../../../../components/inputs/Button";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import { useAppContext } from "../../../../context/AppContext";
import { findTransactionByID } from "../../../../lib/graphqlHelpers";
import { getMultisigAccount } from "../../../../lib/multisigHelpers";
import { DbSignature, DbTransaction } from "../../../../types";

interface Props {
  props: {
    transactionJSON: string;
    transactionID: string;
    txHash: string;
    signatures: DbSignature[];
  };
}

export const getServerSideProps: GetServerSideProps = async (context): Promise<Props> => {
  // get transaction info
  const transactionID = context.params?.transactionID?.toString();
  assert(transactionID, "Transaction ID missing");
  let transactionJSON;
  let txHash;
  let signatures;
  try {
    console.log("Function `findTransactionByID` invoked", transactionID);
    const getRes = await findTransactionByID(transactionID);
    console.log("success", getRes.data);
    txHash = getRes.data.data.findTransactionByID.txHash;
    transactionJSON = getRes.data.data.findTransactionByID.dataJSON;
    signatures = getRes.data.data.findTransactionByID.signatures.data || [];
  } catch (err: unknown) {
    console.log(err);
  }
  return {
    props: {
      transactionJSON,
      txHash,
      transactionID,
      signatures,
    },
  };
};

const TransactionPage = ({
  multisigAddress,
  transactionJSON,
  transactionID,
  signatures,
  txHash,
}: {
  multisigAddress: string;
  transactionJSON: string;
  transactionID: string;
  signatures: DbSignature[];
  txHash: string;
}) => {
  const { state } = useAppContext();
  const [currentSignatures, setCurrentSignatures] = useState(signatures);
  const [broadcastError, setBroadcastError] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [transactionHash, setTransactionHash] = useState(txHash);
  const [accountOnChain, setAccountOnChain] = useState<Account | null>(null);
  const [pubkey, setPubkey] = useState<MultisigThresholdPubkey>();
  const [accountError, setAccountError] = useState(null);
  const txInfo: DbTransaction = transactionJSON ? JSON.parse(transactionJSON) : null;
  const router = useRouter();

  const addSignature = (signature: DbSignature) => {
    setCurrentSignatures((prevState: DbSignature[]) => [...prevState, signature]);
  };

  const fetchMultisig = useCallback(
    async (address: string) => {
      try {
        assert(state.chain.nodeAddress, "Node address missing");
        const client = await StargateClient.connect(state.chain.nodeAddress);
        assert(state.chain.addressPrefix, "addressPrefix missing");
        const result = await getMultisigAccount(address, state.chain.addressPrefix, client);
        setPubkey(result[0]);
        setAccountOnChain(result[1]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setAccountError(error.toString());
        console.log("Account error:", error);
      }
    },
    [state.chain.addressPrefix, state.chain.nodeAddress],
  );

  useEffect(() => {
    const address = router.query.address?.toString();
    if (address) {
      fetchMultisig(address);
    }
  }, [fetchMultisig, router.query.address]);

  const broadcastTx = async () => {
    try {
      setIsBroadcasting(true);
      setBroadcastError("");

      assert(accountOnChain, "Account on chain value missing.");
      assert(
        typeof accountOnChain.accountNumber === "number",
        "Account on chain is missing an accountNumber",
      );
      assert(pubkey, "Pubkey not found on chain or in database");
      const bodyBytes = fromBase64(currentSignatures[0].bodyBytes);
      const signedTxBytes = makeMultisignedTxBytes(
        pubkey,
        txInfo.sequence,
        txInfo.fee,
        bodyBytes,
        new Map(currentSignatures.map((s) => [s.address, fromBase64(s.signature)])),
      );
      assert(state.chain.nodeAddress, "Node address missing");
      const broadcaster = await StargateClient.connect(state.chain.nodeAddress);
      const result = await broadcaster.broadcastTx(signedTxBytes);
      console.log(result);
      const _res = await axios.post(`/api/transaction/${transactionID}`, {
        txHash: result.transactionHash,
      });
      setTransactionHash(result.transactionHash);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setIsBroadcasting(false);
      setBroadcastError(e.toString());
    }
  };

  const isThresholdMet = pubkey
    ? currentSignatures.length >= Number(pubkey.value.threshold)
    : false;

  return (
    <Page rootMultisig={multisigAddress}>
      <StackableContainer base>
        <StackableContainer>
          <h1>{transactionHash ? "Completed Transaction" : "In Progress Transaction"}</h1>
        </StackableContainer>
        {accountError ? (
          <StackableContainer>
            <div className="multisig-error">
              <p>Multisig address could not be found.</p>
            </div>
          </StackableContainer>
        ) : null}
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
                {broadcastError ? <div className="broadcast-error">{broadcastError}</div> : null}
              </>
            ) : null}
            {pubkey ? (
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
        <TransactionInfo tx={txInfo} />
      </StackableContainer>
      <style jsx>{`
        .broadcast-error {
          background: firebrick;
          margin: 20px auto;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          font-family: monospace;
          max-width: 475px;
        }
        .multisig-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
      `}</style>
    </Page>
  );
};

export default TransactionPage;
