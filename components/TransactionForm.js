import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

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
              amount: 0,
            },
          ],
        },
      },
    ],
    fee: {
      amount: [],
      gas: 0,
    },
    signatures: null,
    memo: "",
  },
};

class MultiSigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toAddress: "",
      amount: 0,
      memo: "",
      gas: 2000,
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
    baseTX.value.msg[0].value.amount[0].amount = amount;
    baseTX.value.fee.gas = gas;
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
      <div className="transaction-form">
        <div className="key-input">
          <div className="inputs">
            <label>To address</label>
            <input
              type="text"
              name="toAddress"
              onChange={this.handleChange}
              value={this.state.toAddress}
            />
            {this.state.addressError && (
              <p className="error">{this.state.addressError}</p>
            )}
          </div>
          <div className="inputs">
            <label>Amount in uatom</label>
            <input
              type="number"
              name="amount"
              onChange={this.handleChange}
              value={this.state.amount}
            />
          </div>
          <div className="inputs">
            <label>Gas amount</label>
            <input
              type="number"
              name="gas"
              onChange={this.handleChange}
              value={this.state.gas}
              placeholder="Gas amount"
            />
          </div>
        </div>

        <button
          className="create"
          onClick={this.handleCreate}
          disabled={this.state.processing}
        >
          {this.state.processing ? "processing" : "Create Unsigned Transaction"}
        </button>

        <style jsx>{`
          .threshold label {
            display: block;
            margin: 0 0 1em;
          }
          .threshold input {
            font-size: 2em;
            text-align: right;
            width: 50px;
          }
          .threshold .total {
            font-size: 2em;
          }
          button.create {
            font-size: 2em;
            text-align: center;
            margin: 2em;
            background: lightcoral;
          }
          button.create:hover {
            background: lightcoral;
            font-style: italic;
          }
          button.create:disabled {
            font-style: italic;
            opacity: 0.8;
            cursor: auto;
          }
          button {
            display: block;
            border: 1px solid coral;
            background: none;
            color: white;
            font-size: 1em;
            border-radius: 1em;
            padding: 0.5em 1em;
            cursor: pointer;
          }

          button:hover {
            background: rebeccapurple;
          }
          .transaction-form {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          ul {
            list-style: none;
            padding: 0;
            margin: 1em;
          }

          input {
            background: none;
            color: white;
            border: none;
            padding: 0.25em;
            border-bottom: 2px solid;
            font-size: 1em;
          }
          input::placeholder {
            color: white;
          }

          .key-input {
            margin: 2em 0;
          }
          .inputs {
            margin: 1em 0;
          }

          .inputs label {
            margin-right: 1em;
          }

          .key-input input {
            min-width: 400px;
          }
          .error {
            color: coral;
            font-size: 0.8em;
            text-align: left;
            margin: 0.5em 0;
            padding-left: 9.4em;
          }
        `}</style>
      </div>
    );
  }
}

export default withRouter(MultiSigForm);
