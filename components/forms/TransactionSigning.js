import axios from "axios";
import React from "react";
import { SigningStargateClient } from "@cosmjs/stargate";

import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

export default class TransactionSigning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transaction: this.props.transaction,
      walletAccount: null,
      walletError: null,
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
      await window.keplr.enable("cosmoshub");
      const walletAccount = await window.keplr.getKey("cosmoshub");
      console.log(walletAccount);
      this.setState({ walletAccount });
    } catch (e) {
      console.log("enable err: ", e);
    }
  };

  signTransaction = async () => {
    try {
      const offlineSigner = window.getOfflineSigner("cosmoshub");
      const accounts = await offlineSigner.getAccounts();
      console.log(accounts);
      const signingClient = await SigningStargateClient.offline(offlineSigner);
      const signerData = {
        accountNumber: this.props.tx.accountNumber,
        sequence: this.props.tx.sequence,
        chainId: "cosmoshub",
      };
      const { bodyBytes, signatures } = await signingClient.sign(
        this.state.walletAccount.bech32Address,
        this.props.tx.msgs,
        this.props.tx.fee,
        this.props.tx.memo,
        signerData
      );
      // save body bytes to the tx
      // save/create the signature in the db
      console.log(bodyBytes, signatures);
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <StackableContainer lessPadding>
        <h2>Sign this transaction</h2>
        {this.state.walletAccount ? (
          <Button label="Sign transaction" onClick={this.signTransaction} />
        ) : (
          <Button label="Connect Wallet" onClick={this.connectWallet} />
        )}

        <h2>Current Signatures</h2>
        {!this.state.signatures && (
          <StackableContainer lessPadding lessMargin lessRadius>
            <p>No signatures yet</p>
          </StackableContainer>
        )}
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
        `}</style>
      </StackableContainer>
    );
  }
}
