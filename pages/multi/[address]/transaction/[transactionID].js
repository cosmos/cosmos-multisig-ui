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

export async function getServerSideProps(context) {
  // get multisig account and transaction info
  const client = await StargateClient.connect("143.198.6.14:26657");
  const multisigAddress = context.params.address;
  const holdings = await client.getBalance(multisigAddress, "uatom");
  const transactionID = context.params.transactionID;
  let transactionJSON;
  let accountOnChain;
  let signatures;
  try {
    accountOnChain = await getMultisigAccount(multisigAddress, client);
    console.log("Function `findTransactionByID` invoked", transactionID);
    const getRes = await findTransactionByID(transactionID);
    console.log("success", getRes.data);
    transactionJSON = getRes.data.data.findTransactionByID.dataJSON;
    signatures = getRes.data.data.findTransactionByID.signatures.data || [];
  } catch (err) {
    console.log(err);
  }
  return {
    props: {
      transactionJSON,
      accountOnChain,
      holdings,
      transactionID,
      signatures,
    },
  };
}

const transactionPage = ({
  transactionJSON,
  transactionID,
  signatures,
  accountOnChain,
}) => {
  const [currentSignatures, setCurrentSignatures] = useState(signatures);
  const txInfo = (transactionJSON && JSON.parse(transactionJSON)) || null;
  console.log(accountOnChain);
  const addSignature = (signature) => {
    setCurrentSignatures(currentSignatures.push(signature));
  };
  const broadcastTx = async () => {
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
    const broadcaster = await StargateClient.connect("143.198.6.14:26657");
    const result = await broadcaster.broadcastTx(
      Uint8Array.from(TxRaw.encode(signedTx).finish())
    );
    console.log(result);
  };

  return (
    <Page>
      <StackableContainer base>
        <StackableContainer>
          <h1>In Progress Transaction</h1>
        </StackableContainer>
        <TransactionInfo tx={txInfo} />
        <ThresholdInfo signatures={signatures} account={accountOnChain} />
        {signatures.length >=
          parseInt(accountOnChain.pubkey.value.threshold) && (
          <Button label="Broadcast Transaction" onClick={broadcastTx} primary />
        )}
        <TransactionSigning
          tx={txInfo}
          transactionID={transactionID}
          signatures={signatures}
          addSignature={addSignature}
        />
      </StackableContainer>

      <style jsx>{`
        .broadcast {
        }
      `}</style>
    </Page>
  );
};

export default transactionPage;
