import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

class MultiSigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pubkeys: [],
      key: "",
      nickname: "",
      threshold: 2,
      keyError: "",
      processing: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleAddKey = () => {
    this.setState((state) => {
      let key = this.state.key;
      let nickname = this.state.nickname;
      const pubkeys = state.pubkeys;
      if (state.key.length === 77) {
        pubkeys.push({ pubkey: state.key, nickname: state.nickname });

        key = "";
        nickname = "";

        return { pubkeys, key, nickname };
      } else {
        return { keyError: "Must be a cosmoshub public key" };
      }
    });
  };

  handleCreate = async () => {
    this.setState({ processing: true });
    const res = await axios.post("/api/multiaddress", {
      members: this.state.pubkeys,
      threshold: this.state.threshold,
    });

    this.props.router.push(`/multi/${res.data}`);
  };

  render() {
    return (
      <div className="multisig-form">
        <ul>
          {this.state.pubkeys.map((key, index) => (
            <li key={index}>
              {key.nickname}: {key.pubkey}
            </li>
          ))}
        </ul>
        <div className="key-input">
          <div className="inputs">
            <input
              type="text"
              name="nickname"
              onChange={this.handleChange}
              value={this.state.nickname}
              placeholder="Nickname"
            />
          </div>
          <div className="inputs">
            <input
              type="text"
              name="key"
              onChange={this.handleChange}
              value={this.state.key}
              placeholder="Public Key"
            />
            {this.state.keyError && (
              <p className="error">{this.state.keyError}</p>
            )}
          </div>
          <button onClick={this.handleAddKey}>Add pubkey</button>
        </div>
        {this.state.pubkeys.length > 1 && (
          <div>
            <div className="threshold">
              <label htmlFor="threshold">
                Votes Needed to complete transaction
              </label>
              <input
                type="number"
                name="threshold"
                onChange={this.handleChange}
                value={this.state.threshold}
              />{" "}
              <span className="total">of {this.state.pubkeys.length}</span>
            </div>
            <button
              className="create"
              onClick={this.handleCreate}
              disabled={this.state.processing}
            >
              {this.state.processing ? "processing" : "Create Multisig"}
            </button>
          </div>
        )}
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
          .multisig-form {
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

          .key-input input {
            min-width: 400px;
          }
          .error {
            color: coral;
            font-size: 0.8em;
            text-align: left;
            margin: 0.5em 0;
          }
        `}</style>
      </div>
    );
  }
}

export default withRouter(MultiSigForm);
