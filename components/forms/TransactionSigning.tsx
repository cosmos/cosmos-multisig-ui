import React, { useState } from "react";
import axios from "axios";
import { toBase64 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";

import { useAppContext } from "../../context/AppContext";
import Button from "../inputs/Button";
import HashView from "../dataViews/HashView";
import StackableContainer from "../layout/StackableContainer";
import { DbSignature, DbTransaction, WalletAccount } from "../../types";

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { makeCosmoshubPath } from "@cosmjs/amino";

interface Props {
  signatures: DbSignature[];
  tx: DbTransaction;
  transactionID: string;
  addSignature: (signature: DbSignature) => void;
}

const TransactionSigning = (props: Props) => {
  const { state } = useAppContext();
  const [walletAccount, setWalletAccount] = useState<WalletAccount>();
  const [sigError, setSigError] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [walletType, setWalletType] = useState<"Keplr" | "Ledger">();
  const [ledgerSigner, setLedgerSigner] = useState({});

  const connectKeplr = async () => {
    try {
      assert(state.chain.chainId, "chainId missing");
      await window.keplr.enable(state.chain.chainId);
      const tempWalletAccount = await window.keplr.getKey(state.chain.chainId);
      console.log(tempWalletAccount);
      const tempHasSigned = props.signatures.some(
        (sig) => sig.address === tempWalletAccount.bech32Address,
      );
      setWalletAccount(tempWalletAccount);
      setHasSigned(tempHasSigned);
      setWalletType("Keplr");
    } catch (e) {
      console.log("enable err: ", e);
    }
  };

  const connectLedger = async () => {
    assert(state.chain.addressPrefix, "addressPrefix missing");

    // Prepare ledger
    const ledgerTransport = await TransportWebUSB.create(120000, 120000);

    // Setup signer
    const offlineSigner = new LedgerSigner(ledgerTransport, {
      hdPaths: [makeCosmoshubPath(0)],
      prefix: state.chain.addressPrefix,
    });
    console.log(offlineSigner);
    const accounts = await offlineSigner.getAccounts();
    console.log(accounts);
    const tempWalletAccount: WalletAccount = {
      bech32Address: accounts[0].address,
      pubkey: accounts[0].pubkey,
      algo: accounts[0].algo,
    };

    const tempHasSigned = props.signatures.some(
      (sig) => sig.address === tempWalletAccount.bech32Address,
    );
    setWalletAccount(tempWalletAccount);
    setHasSigned(tempHasSigned);
    setLedgerSigner(offlineSigner);
    setWalletType("Ledger");
  };

  const signTransaction = async () => {
    assert(state.chain.chainId, "chainId missing");

    const offlineSigner =
      walletType === "Keplr" ? window.getOfflineSignerOnlyAmino(state.chain.chainId) : ledgerSigner;

    const signerAddress = walletAccount?.bech32Address;
    assert(signerAddress, "Missing signer address");
    const signingClient = await SigningStargateClient.offline(offlineSigner);

    const signerData = {
      accountNumber: props.tx.accountNumber,
      sequence: props.tx.sequence,
      chainId: state.chain.chainId,
    };

    const { bodyBytes, signatures } = await signingClient.sign(
      signerAddress,
      props.tx.msgs,
      props.tx.fee,
      props.tx.memo,
      signerData,
    );

    // check existing signatures
    const bases64EncodedSignature = toBase64(signatures[0]);
    const bases64EncodedBodyBytes = toBase64(bodyBytes);
    const prevSigMatch = props.signatures.findIndex(
      (signature) => signature.signature === bases64EncodedSignature,
    );

    if (prevSigMatch > -1) {
      setSigError("This account has already signed.");
    } else {
      const signature = {
        bodyBytes: bases64EncodedBodyBytes,
        signature: bases64EncodedSignature,
        address: signerAddress,
      };
      const _res = await axios.post(`/api/transaction/${props.transactionID}/signature`, signature);
      props.addSignature(signature);
      setHasSigned(true);
    }
  };

  return (
    <StackableContainer lessPadding lessMargin>
      {hasSigned ? (
        <StackableContainer lessPadding lessMargin lessRadius>
          <div className="confirmation">
            <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
            </svg>
            <p>You've signed this transaction.</p>
          </div>
        </StackableContainer>
      ) : (
        <>
          <h2>Sign this transaction</h2>
          {walletAccount ? (
            <>
              <p>
                Connected signer {walletAccount.bech32Address} (
                {walletType ?? "Unknown wallet type"}).
              </p>
              <Button label="Sign transaction" onClick={signTransaction} />
            </>
          ) : (
            <>
              <Button label="Connect Keplr" onClick={connectKeplr} />
              <Button label="Connect Ledger" onClick={connectLedger} />
            </>
          )}
        </>
      )}
      {sigError && (
        <StackableContainer lessPadding lessRadius lessMargin>
          <div className="signature-error">
            <p>This account has already signed this transaction.</p>
          </div>
        </StackableContainer>
      )}
      <h2>Current Signers</h2>
      <StackableContainer lessPadding lessMargin lessRadius>
        {props.signatures.map((signature, i) => (
          <StackableContainer lessPadding lessRadius lessMargin key={`${signature.address}_${i}`}>
            <HashView hash={signature.address} />
          </StackableContainer>
        ))}

        {props.signatures.length === 0 && <p>No signatures yet</p>}
      </StackableContainer>
      <style jsx>{`
        p {
          text-align: center;
          max-width: none;
        }
        h2 {
          margin-top: 1em;
        }
        h2:first-child {
          margin-top: 0;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .signature-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
        .signature-error p:first-child {
          margin-top: 0;
        }
        .confirmation {
          display: flex;
          justify-content: center;
        }
        .confirmation svg {
          height: 0.8em;
          margin-right: 0.5em;
        }
      `}</style>
    </StackableContainer>
  );
};

export default TransactionSigning;
