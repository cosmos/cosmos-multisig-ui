import axios from "axios";
import React from "react";
import { withRouter } from "next/router";
import StackableContainer from "../layout/StackableContainer";
const baseTX = {
  type: "cosmos-sdk/StdTx",
  value: {
    msg: [
      {
        type: "cosmos-sdk/MsgSend",
        value: {
          from_address: "",
          to_address: "",
          amount: [
            {
              denom: "uatom",
              amount: "0",
            },
          ],
        },
      },
    ],
    fee: {
      amount: [],
      gas: "0",
    },
    signatures: null,
    memo: "",
  },
};

class TransactionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: 0,
      memo: "",
      gas: 200000,
      processing: false,
      addressError: "",
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  createTransaction = (toAddress, amount, gas) => {
    baseTX.value.msg[0].value.to_address = toAddress;
    baseTX.value.msg[0].value.from_address = this.props.multiAddress;
    baseTX.value.msg[0].value.amount[0].amount = amount.toString();
    baseTX.value.fee.gas = gas.toString();
    return baseTX;
  };

  handleCreate = async () => {
    if (this.state.toAddress.length === 45) {
      this.setState({ processing: true });
      const tx = this.createTransaction(
        this.state.toAddress,
        this.state.amount,
        this.state.gas
      );

      const res = await axios.post("/api/transaction", {
        unsignedJson: JSON.stringify(tx),
        multiAddress: this.props.multiAddress,
      });

      this.props.router.push(
        `${this.props.multiAddress}/transaction/${res.data}`
      );
    } else {
      this.setState({ addressError: "Use a valid cosmos-hub address" });
    }
  };

  render() {
    return (
      <StackableContainer lessPadding>
        <h2>Create transaction</h2>
        <style jsx>{``}</style>
      </StackableContainer>
    );
  }
}

export default withRouter(TransactionForm);
