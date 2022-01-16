import React, { useState, useEffect } from "react";
import axios from "axios";
import { toBase64 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";

import { useAppContext } from "../../context/AppContext";
import Button from "../inputs/Button";
import HashView from "../dataViews/HashView";
import StackableContainer from "../layout/StackableContainer";

const TransactionSigning = (props) => {
  const { state } = useAppContext();
  const [walletAccount, setWalletAccount] = useState(null);
  const [sigError, setSigError] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      await window.keplr.enable(state.chain.chainId);
      const tempWalletAccount = await window.keplr.getKey(state.chain.chainId);
      const tempHasSigned = props.signatures.some(
        (sig) => sig.address === tempWalletAccount.bech32Address,
      );
      setWalletAccount(tempWalletAccount);
      setHasSigned(tempHasSigned);
    } catch (e) {
      console.log("enable err: ", e);
    }
  };

  const signTransaction = async () => {
    try {
      window.keplr.defaultOptions = {
        sign: {
          preferNoSetMemo: true,
          preferNoSetFee: true,
          disableBalanceCheck: true,
        },
      };
      const offlineSigner = window.getOfflineSignerOnlyAmino(state.chain.chainId);
      const signingClient = await SigningStargateClient.offline(offlineSigner);
      const signerData = {
        accountNumber: props.tx.accountNumber,
        sequence: props.tx.sequence,
        chainId: state.chain.chainId,
      };
      const { bodyBytes, signatures } = await signingClient.sign(
        walletAccount.bech32Address,
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
          address: walletAccount.bech32Address,
        };
        const _res = await axios.post(
          `/api/transaction/${props.transactionID}/signature`,
          signature,
        );
        props.addSignature(signature);
        setHasSigned(true);
      }
    } catch (error) {
      console.log("Error creating signature:", error);
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
            <Button label="Sign transaction" onClick={signTransaction} />
          ) : (
            <Button label="Connect Wallet" onClick={connectWallet} />
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
