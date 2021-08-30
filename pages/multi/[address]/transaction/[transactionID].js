import axios from "axios";
import { StargateClient, makeMultisignedTx } from "@cosmjs/stargate";
import { TxRaw } from "@cosmjs/stargate/build/codec/cosmos/tx/v1beta1/tx";
import { useState } from "react";
import { encode, decode } from "uint8-to-base64";
import { createMultisigThresholdPubkey, pubkeyToAddress } from "@cosmjs/amino";
import { registry } from "@cosmjs/proto-signing";

import Button from "../../../../components/inputs/Button";
import { findTransactionByID } from "../../../../lib/graphqlHelpers";
import { getMultisigAccount } from "../../../../lib/multisigHelpers";
import Page from "../../../../components/layout/Page";
import StackableContainer from "../../../../components/layout/StackableContainer";
import ThresholdInfo from "../../../../components/dataViews/ThresholdInfo";
import TransactionInfo from "../../../../components/dataViews/TransactionInfo";
import TransactionSigning from "../../../../components/forms/TransactionSigning";
import CompletedTransaction from "../../../../components/dataViews/CompletedTransaction";

export async function getServerSideProps(context) {
  // get multisig account and transaction info
  const nodeAddress = process.env.NEXT_PUBLIC_NODE_ADDRESS;
  const client = await StargateClient.connect(nodeAddress);
  const multisigAddress = context.params.address;
  const holdings = await client.getBalance(multisigAddress, "uatom");
  const transactionID = context.params.transactionID;
  let transactionJSON;
  let txHash;
  let accountOnChain;
  let signatures;
  try {
    accountOnChain = await getMultisigAccount(multisigAddress, client);
    console.log("Function `findTransactionByID` invoked", transactionID);
    const getRes = await findTransactionByID(transactionID);
    console.log("success", getRes.data);
    txHash = getRes.data.data.findTransactionByID.txHash;
    transactionJSON = getRes.data.data.findTransactionByID.dataJSON;
    signatures = getRes.data.data.findTransactionByID.signatures.data || [];
  } catch (err) {
    console.log(err);
  }
  return {
    props: {
      multisigAddress,
      transactionJSON,
      txHash,
      accountOnChain,
      holdings,
      transactionID,
      signatures,
      nodeAddress,
    },
  };
}

const transactionPage = ({
  multisigAddress,
  transactionJSON,
  transactionID,
  signatures,
  accountOnChain,
  nodeAddress,
  txHash,
}) => {
  const [currentSignatures, setCurrentSignatures] = useState(signatures);
  const [broadcastError, setBroadcastError] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [transactionHash, setTransactionHash] = useState(txHash);
  const txInfo = (transactionJSON && JSON.parse(transactionJSON)) || null;
  const addSignature = (signature) => {
    setCurrentSignatures((currentSignatures) => [
      ...currentSignatures,
      signature,
    ]);
  };
  const broadcastTx = async () => {
    try {
      setIsBroadcasting(true);
      setBroadcastError("");
      const signatures = new Map();
      currentSignatures.forEach((signature) => {
        signatures.set(signature.address, decode(signature.signature));
      });

      const bodyBytes = decode(currentSignatures[0].bodyBytes);
      const signedTx = makeMultisignedTx(
        accountOnChain.pubkey,
        txInfo.sequence,
        txInfo.fee,
        bodyBytes,
        signatures
      );
      const broadcaster = await StargateClient.connect(nodeAddress);
      const result = await broadcaster.broadcastTx(
        Uint8Array.from(TxRaw.encode(signedTx).finish())
      );
      console.log(result);
      const res = await axios.post(`/api/transaction/${transactionID}`, {
        txHash: result.transactionHash,
      });
      setTransactionHash(result.transactionHash);
    } catch (e) {
      setIsBroadcasting(false);
      setBroadcastError(e.message);
    }
  };

  return (
    <Page rootMultisig={multisigAddress}>
      <StackableContainer base>
        <StackableContainer>
          <h1>
            {transactionHash
              ? "Completed Transaction"
              : "In Progress Transaction"}
          </h1>
        </StackableContainer>

        {transactionHash && (
          <CompletedTransaction transactionHash={transactionHash} />
        )}
        <TransactionInfo tx={txInfo} />
        {!transactionHash && (
          <ThresholdInfo
            signatures={currentSignatures}
            account={accountOnChain}
          />
        )}
        {currentSignatures.length >=
          parseInt(accountOnChain.pubkey.value.threshold) &&
          !transactionHash && (
            <>
              <Button
                label={
                  isBroadcasting ? "Broadcasting..." : "Broadcast Transaction"
                }
                onClick={broadcastTx}
                primary
                disabled={isBroadcasting}
              />
              {broadcastError && (
                <div className="broadcast-error">{broadcastError}</div>
              )}
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
      `}</style>
    </Page>
  );
};

export default transactionPage;
