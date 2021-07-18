import axios from "axios";
import { encode, decode } from "uint8-to-base64";
import React from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { registry } from "@cosmjs/proto-signing";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
      walletAccount: null,
      walletError: null,
      sigError: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.transaction && this.props.transaction) {
      this.setState({ transaction: this.props.transaction });
      console.log(JSON.parse(this.props.transaction.signatures));
    }
  }

  handleBroadcast = async () => {
    this.setState({ processing: true });
    const res = await axios.get(
      `/api/transaction/${this.state.transaction.uuid}/broadcast`
    );

    this.setState({
      transaction: res.data,
      processing: false,
    });
  };

  clickFileUpload = () => {
    this.fileInput.current.click();
  };

  connectWallet = async () => {
    try {
      await window.keplr.enable("cosmoshub-4");
      const walletAccount = await window.keplr.getKey("cosmoshub-4");
      this.setState({ walletAccount });
    } catch (e) {
      console.log("enable err: ", e);
    }
  };

  signTransaction = async () => {
    try {
      const offlineSigner = window.getOfflineSigner("cosmoshub-4");
      const accounts = await offlineSigner.getAccounts();
      console.log("accounts", accounts);
      console.log("wallet address", this.state.walletAccount.bech32Address);
      const signingClient = await SigningStargateClient.offline(offlineSigner);
      const signerData = {
        accountNumber: this.props.tx.accountNumber,
        sequence: this.props.tx.sequence,
        chainId: "cosmoshub-4",
      };
      console.log(
        this.state.walletAccount.bech32Address,
        this.props.tx.msgs,
        this.props.tx.fee,
        this.props.tx.memo,
        signerData
      );
      const { bodyBytes, signatures } = await signingClient.sign(
        this.state.walletAccount.bech32Address,
        this.props.tx.msgs,
        this.props.tx.fee,
        this.props.tx.memo,
        signerData
      );
      console.log(`bodyBytes ${bodyBytes}`, `signatures ${signatures}`);
      // check existing signatures
      // const bases64EncodedSignature = encode(signatures[0]);
      // const prevSigMatch = this.props.signatures.findIndex(
      //   (signature) => signature.signature === bases64EncodedSignature
      // );

      // if (prevSigMatch > -1) {
      //   this.setState({ sigError: "This account has already signed." });
      // } else {
      //   const signature = {
      //     bodyBytes,
      //     signature: bases64EncodedSignature,
      //     address: this.state.walletAccount.bech32Address,
      //   };
      //   const res = await axios.post(
      //     `/api/transaction/${this.props.transactionID}/signature`,
      //     signature
      //   );
      //   console.log(res.data);
      //   this.props.addSignature(res.data);
      // }
    } catch (error) {
      console.log("Error creating signature:", error);
    }
  };

  render() {
    return (
      <StackableContainer lessPadding lessMargin>
        <h2>Sign this transaction</h2>
        {this.state.walletAccount ? (
          <Button label="Sign transaction" onClick={this.signTransaction} />
        ) : (
          <Button label="Connect Wallet" onClick={this.connectWallet} />
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
            <StackableContainer
              lessPadding
              lessRadius
              lessMargin
              key={`${signature.address}_${i}`}
            >
              <p>{signature.address}</p>
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
        `}</style>
      </StackableContainer>
    );
  }
}
