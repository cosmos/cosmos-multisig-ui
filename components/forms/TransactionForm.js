import axios from "axios";
import { calculateFee } from "@cosmjs/stargate";
import { Decimal } from "@cosmjs/math";
import React from "react";
import { withRouter } from "next/router";

import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

class TransactionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: "0",
      memo: "",
      gas: 200000,
      gasPrice: process.env.NEXT_PUBLIC_GAS_PRICE,
      processing: false,
      addressError: "",
    };
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  createTransaction(toAddress, amount, gas) {
    const amountInAtomics = Decimal.fromUserInput(
      amount,
      Number(process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT),
    ).atomics;
    const msgSend = {
      fromAddress: this.props.address,
      toAddress: toAddress,
      amount: [
        {
          amount: amountInAtomics,
          denom: process.env.NEXT_PUBLIC_DENOM,
        },
      ],
    };
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
    const fee = calculateFee(Number(gas), this.state.gasPrice);
    return {
      accountNumber: this.props.accountOnChain.accountNumber,
      sequence: this.props.accountOnChain.sequence,
      chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
      msgs: [msg],
      fee: fee,
      memo: this.state.memo,
    };
  }

  async handleCreate() {
    const addressError = checkAddress(this.state.toAddress);
    if (addressError) {
      this.setState({
        addressError: `Invalid address for network ${process.env.NEXT_PUBLIC_CHAIN_ID}: ${addressError}`,
      });
      return;
    }

    this.setState({ processing: true });
    const tx = this.createTransaction(this.state.toAddress, this.state.amount, this.state.gas);
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    this.props.router.push(`${this.props.address}/transaction/${transactionID}`);
  }

  render() {
    return (
      <StackableContainer lessPadding>
        <button className="remove" onClick={this.props.closeForm}>
          ✕
        </button>
        <h2>Create New transaction</h2>
        <div className="form-item">
          <Input
            label="To Address"
            name="toAddress"
            value={this.state.toAddress}
            onChange={this.handleChange}
            error={this.state.addressError}
            placeholder={exampleAddress()}
          />
        </div>
        <div className="form-item">
          <Input
            label={`Amount (${process.env.NEXT_PUBLIC_DISPLAY_DENOM})`}
            name="amount"
            type="number"
            value={this.state.amount}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Gas Limit"
            name="gas"
            type="number"
            value={this.state.gas}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-item">
          <Input
            label="Gas Price"
            name="gas_price"
            type="string"
            value={this.state.gasPrice}
            disabled={true}
          />
        </div>
        <div className="form-item">
          <Input
            label="Memo"
            name="memo"
            type="text"
            value={this.state.memo}
            onChange={this.handleChange}
          />
        </div>
        <Button label="Create Transaction" onClick={this.handleCreate} />
        <style jsx>{`
          p {
            margin-top: 15px;
          }
          .form-item {
            margin-top: 1.5em;
          }
          button.remove {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            color: white;
            position: absolute;
            right: 10px;
            top: 10px;
          }
        `}</style>
      </StackableContainer>
    );
  }
}

export default withRouter(TransactionForm);
