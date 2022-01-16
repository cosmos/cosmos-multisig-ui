import React from "react";
import axios from "axios";
import { toBase64 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";

import Button from "../inputs/Button";
import HashView from "../dataViews/HashView";
import StackableContainer from "../layout/StackableContainer";

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
      walletAccount: null,
      walletError: null,
      sigError: null,
      hasSigned: false,
    };
  }

  componentDidMount() {
    this.connectWallet();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.transaction && this.props.transaction) {
      this.setState({ transaction: this.props.transaction });
      console.log(JSON.parse(this.props.transaction.signatures));
    }
  }

  async handleBroadcast() {
    this.setState({ processing: true });
    const res = await axios.get(`/api/transaction/${this.state.transaction.uuid}/broadcast`);

    this.setState({
      transaction: res.data,
      processing: false,
    });
  }

  clickFileUpload() {
    this.fileInput.current.click();
  }

  async connectWallet() {
    try {
      await window.keplr.enable(process.env.NEXT_PUBLIC_CHAIN_ID);
      const walletAccount = await window.keplr.getKey(process.env.NEXT_PUBLIC_CHAIN_ID);
      const hasSigned = this.props.signatures.some(
        (sig) => sig.address === walletAccount.bech32Address,
      );
      this.setState({ walletAccount, hasSigned });
    } catch (e) {
      console.log("enable err: ", e);
    }
  }

  async signTransaction() {
    try {
      window.keplr.defaultOptions = {
        sign: {
          preferNoSetMemo: true,
          preferNoSetFee: true,
          disableBalanceCheck: true,
        },
      };
      const offlineSigner = window.getOfflineSignerOnlyAmino(process.env.NEXT_PUBLIC_CHAIN_ID);
      const signingClient = await SigningStargateClient.offline(offlineSigner);
      const signerData = {
        accountNumber: this.props.tx.accountNumber,
        sequence: this.props.tx.sequence,
        chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      };
      const { bodyBytes, signatures } = await signingClient.sign(
        this.state.walletAccount.bech32Address,
        this.props.tx.msgs,
        this.props.tx.fee,
        this.props.tx.memo,
        signerData,
      );
      // check existing signatures
      const bases64EncodedSignature = toBase64(signatures[0]);
      const bases64EncodedBodyBytes = toBase64(bodyBytes);
      const prevSigMatch = this.props.signatures.findIndex(
        (signature) => signature.signature === bases64EncodedSignature,
      );

      if (prevSigMatch > -1) {
        this.setState({ sigError: "This account has already signed." });
      } else {
        const signature = {
          bodyBytes: bases64EncodedBodyBytes,
          signature: bases64EncodedSignature,
          address: this.state.walletAccount.bech32Address,
        };
        const _res = await axios.post(
          `/api/transaction/${this.props.transactionID}/signature`,
          signature,
        );
        this.props.addSignature(signature);
        this.setState({ hasSigned: true });
      }
    } catch (error) {
      console.log("Error creating signature:", error);
    }
  }

  render() {
    return (
      <StackableContainer lessPadding lessMargin>
        {this.state.hasSigned ? (
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
            {this.state.walletAccount ? (
              <Button label="Sign transaction" onClick={() => this.signTransaction()} />
            ) : (
              <Button label="Connect Wallet" onClick={() => this.connectWallet()} />
            )}
          </>
        )}
        {this.state.sigError && (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>This account has already signed this transaction.</p>
            </div>
          </StackableContainer>
        )}
        <h2>Current Signers</h2>
        <StackableContainer lessPadding lessMargin lessRadius>
          {this.props.signatures.map((signature, i) => (
            <StackableContainer lessPadding lessRadius lessMargin key={`${signature.address}_${i}`}>
              <HashView hash={signature.address} />
            </StackableContainer>
          ))}

          {this.props.signatures.length === 0 && <p>No signatures yet</p>}
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
  }
}
