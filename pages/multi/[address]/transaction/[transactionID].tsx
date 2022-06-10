import axios from "axios";
import React from "react";
import { GetServerSideProps } from "next";
import { StargateClient, makeMultisignedTx } from "@cosmjs/stargate";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fromBase64 } from "@cosmjs/encoding";
import { MultisigThresholdPubkey } from "@cosmjs/amino";

import { DbSignature, DbTransaction } from "../../../../types";
import { useAppContext } from "../../../../context/AppContext";
import Button from "../../../../components/inputs/Button";
import { findTransactionByID } from "../../../../lib/graphqlHelpers";
import { AccountWithPubkey, getMultisigAccount } from "../../../../lib/multisigHelpers";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import ThresholdInfo from "../../../../components/dataViews/ThresholdInfo";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";
import CompletedTransaction from "../../../../components/dataViews/CompletedTransaction";
import { assert } from "@cosmjs/utils";

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

const transactionPage = ({
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
  const [_holdings, setHoldings] = useState<Coin | null>(null);
  const [accountOnChain, setAccountOnChain] = useState<AccountWithPubkey | null>(null);
  const [accountError, setAccountError] = useState(null);
  const txInfo: DbTransaction = (transactionJSON && JSON.parse(transactionJSON)) || null;
  const router = useRouter();

  const addSignature = (signature: DbSignature) => {
    setCurrentSignatures((prevState: DbSignature[]) => [...prevState, signature]);
  };

  useEffect(() => {
    const address = router.query.address?.toString();
    if (address) {
      fetchMultisig(address);
    }
  }, [state, router.query.address]);

  const fetchMultisig = async (address: string) => {
    try {
      assert(state.chain.nodeAddress, "Node address missing");
      const client = await StargateClient.connect(state.chain.nodeAddress);
      assert(state.chain.denom, "denom missing");
      const tempHoldings = await client.getBalance(address, state.chain.denom);
      const tempAccountOnChain = await getMultisigAccount(address, client);
      setHoldings(tempHoldings);
      setAccountOnChain(tempAccountOnChain);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setAccountError(error.toString());
      console.log("Account error:", error);
    }
  };

  const broadcastTx = async () => {
    try {
      setIsBroadcasting(true);
      setBroadcastError("");

      if (!accountOnChain) throw new Error("Account on chain value missing.");

      const bodyBytes = fromBase64(currentSignatures[0].bodyBytes);
      const signedTx = makeMultisignedTx(
        accountOnChain.pubkey as MultisigThresholdPubkey,
        txInfo.sequence,
        txInfo.fee,
        bodyBytes,
        new Map(currentSignatures.map((s) => [s.address, fromBase64(s.signature)])),
      );
      assert(state.chain.nodeAddress, "Node address missing");
      const broadcaster = await StargateClient.connect(state.chain.nodeAddress);
      const result = await broadcaster.broadcastTx(
        Uint8Array.from(TxRaw.encode(signedTx).finish()),
      );
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

  return (
    <Page rootMultisig={multisigAddress}>
      <StackableContainer base>
        <StackableContainer>
          <h1>{transactionHash ? "Completed Transaction" : "In Progress Transaction"}</h1>
        </StackableContainer>
        {accountError && (
          <StackableContainer>
            <div className="multisig-error">
              <p>Multisig address could not be found.</p>
            </div>
          </StackableContainer>
        )}
        {transactionHash && <CompletedTransaction transactionHash={transactionHash} />}
        <TransactionInfo tx={txInfo} />
        {!transactionHash && accountOnChain && (
          <ThresholdInfo signatures={currentSignatures} account={accountOnChain} />
        )}
        {accountOnChain &&
          currentSignatures.length >= parseInt(accountOnChain.pubkey.value.threshold, 10) &&
          !transactionHash && (
            <>
              <Button
                label={isBroadcasting ? "Broadcasting..." : "Broadcast Transaction"}
                onClick={broadcastTx}
                primary
                disabled={isBroadcasting}
              />
              {broadcastError && <div className="broadcast-error">{broadcastError}</div>}
            </>
          )}
        {!transactionHash && (
          <TransactionSigning
            tx={txInfo}
            transactionID={transactionID}
            signatures={currentSignatures}
            addSignature={addSignature}
          />
        )}
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

export default transactionPage;
