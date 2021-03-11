import axios from "axios";
import React from "react";
import { withRouter } from "next/router";
import { rawSecp256k1PubkeyToAddress } from "@cosmjs/launchpad";

import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import ThresholdInput from "../inputs/ThresholdInput";

let emptyPubKeyGroup = () => {
  return { pubkey: "", nickname: "", keyError: "", address: "" };
};

class MultiSigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pubkeys: [emptyPubKeyGroup(), emptyPubKeyGroup()],
      threshold: 2,
      processing: false,
    };
  }

  handleChangeThreshold = (e) => {
    const threshold =
      e.target.value <= this.state.pubkeys.length
        ? e.target.value
        : this.state.pubkeys.length;
    this.setState({ threshold });
  };

  handleKeyGroupChange = (index, e) => {
    const { pubkeys } = this.state;
    pubkeys[index][e.target.name] = e.target.value;
    this.setState({ pubkeys });
  };

  handleAddKey = () => {
    this.setState({ pubkeys: this.state.pubkeys.concat(emptyPubKeyGroup()) });
  };

  handleRemove = (index) => {
    this.setState((prevState) => {
      const pubkeys = Array.from(prevState.pubkeys);
      pubkeys.splice(index, 1);

      const threshold =
        prevState.threshold > pubkeys.length
          ? pubkeys.length
          : prevState.threshold;

      return { pubkeys, threshold };
    });
  };

  handleKeyBlur = (index, e) => {
    const pubkey = e.target.value;
    try {
      const address = rawSecp256k1PubkeyToAddress(pubkey);
      const { pubkeys } = this.state;
      pubkeys[index].address = address;
      this.setState({ pubkeys });
    } catch (error) {
      const { pubkeys } = this.state;
      pubkeys[index].keyError = "Invalid Secp256k1 pubkey";
      this.setState({ pubkeys });
    }
  };

  handleCreate = async () => {
    this.setState({ processing: true });
    const multisig = {
      threshold: this.state.threshold,
      address: "cosmos1fjrcosmosDUMMYADDRESSqwpsvcrskv80wj82h",
      sourceAddresses: this.state.pubkeys.map((pubkey) => {
        return {
          nickname: pubkey.nickname,
          address: pubkey.address,
          pubkey: pubkey.pubkey,
        };
      }),
    };
    const res = await axios.post(
      "/.netlify/functions/create-multisig",
      multisig
    );
    const multiAddress = res.data.data.address;
    this.props.router.push(`/multi/${multiAddress}`);
  };

  render() {
    return (
      <>
        <StackableContainer>
          <StackableContainer lessPadding>
            <p>
              Add the public keys of the addresses that will make up this
              multisig. The 'Nickname' field is a casual name for the key that
              will be used to help identify it in the future.
            </p>
          </StackableContainer>
          {this.state.pubkeys.map((pubkeyGroup, index) => (
            <StackableContainer lessPadding lessMargin key={index}>
              <div className="key-row">
                {this.state.pubkeys.length > 2 && (
                  <button
                    className="remove"
                    onClick={() => {
                      this.handleRemove(index);
                    }}
                  >
                    ✕
                  </button>
                )}
                <div className="key-inputs">
                  <Input
                    onChange={(e) => {
                      this.handleKeyGroupChange(index, e);
                    }}
                    value={pubkeyGroup.nickname}
                    label="Nickname"
                    name="nickname"
                    width="30%"
                  />
                  <Input
                    onChange={(e) => {
                      this.handleKeyGroupChange(index, e);
                    }}
                    value={pubkeyGroup.pubkey}
                    label="Public Key"
                    name="pubkey"
                    width="65%"
                    error={pubkeyGroup.keyError}
                    onBlur={(e) => {
                      this.handleKeyBlur(index, e);
                    }}
                  />
                </div>
              </div>
            </StackableContainer>
          ))}

          <Button label="Add another key" onClick={this.handleAddKey} />
        </StackableContainer>
        <StackableContainer>
          <StackableContainer lessPadding>
            <ThresholdInput
              onChange={this.handleChangeThreshold}
              value={this.state.threshold}
              total={this.state.pubkeys.length}
            />
          </StackableContainer>

          <StackableContainer lessPadding lessMargin>
            <p>
              This means that each transaction this multisig makes will require{" "}
              {this.state.threshold} of the members to sign it for it to be
              accepted by the validators.
            </p>
          </StackableContainer>
        </StackableContainer>
        <Button primary onClick={this.handleCreate} label="Create Multisig" />
        <style jsx>{`
          .key-inputs {
            display: flex;
            justify-content: space-between;
            max-width: 350px;
          }
          .error {
            color: coral;
            font-size: 0.8em;
            text-align: left;
            margin: 0.5em 0;
          }
          .key-row {
            position: relative;
          }
          button.remove {
            background: rgba(255, 255, 255, 0.2);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            color: white;
            position: absolute;
            right: -23px;
            top: -22px;
          }
        `}</style>
      </>
    );
  }
}

export default withRouter(MultiSigForm);
