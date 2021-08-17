import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

import Button from "../inputs/Button";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../lib/multisigHelpers";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import ThresholdInput from "../inputs/ThresholdInput";

let emptyPubKeyGroup = () => {
  return { compressedPubkey: "", keyError: "" };
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
    try {
      let compressedPubkey = e.target.value;
      if (compressedPubkey.length !== 44) {
        throw new Error("Invalid Secp256k1 pubkey");
      }
      const { pubkeys } = this.state;
      pubkeys[index].compressedPubkey = compressedPubkey;
      pubkeys[index].keyError = "";
      this.setState({ pubkeys });
    } catch (error) {
      console.log(error);
      const { pubkeys } = this.state;
      pubkeys[index].keyError = error.message;
      this.setState({ pubkeys });
    }
  };

  handleCreate = async () => {
    this.setState({ processing: true });
    const compressedPubkeys = this.state.pubkeys.map(
      (item) => item.compressedPubkey
    );
    let multisigAddress;
    try {
      multisigAddress = await createMultisigFromCompressedSecp256k1Pubkeys(
        compressedPubkeys,
        parseInt(this.state.threshold, 10)
      );
      this.props.router.push(`/multi/${multisigAddress}`);
    } catch (error) {
      console.log("Failed to creat multisig: ", error);
    }
  };

  render() {
    return (
      <>
        <StackableContainer>
          <StackableContainer lessPadding>
            <p>Add the Public Keys that will make up this multisig.</p>
            <p>
              Note this only supports compressed Secp256k1 pubkeys, double check
              this is the algo used to create your account.
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
                    value={pubkeyGroup.compressedPubkey}
                    label="Public Key"
                    name="compressedPubkey"
                    width="100%"
                    placeholder="Akd/qKMWdZXyiMnSu6aFLpQEGDO0ijyal9mXUIcVaPNX"
                    error={pubkeyGroup.keyError}
                    onBlur={(e) => {
                      this.handleKeyBlur(index, e);
                    }}
                  />
                </div>
              </div>
            </StackableContainer>
          ))}

          <Button label="Add another pubkey" onClick={this.handleAddKey} />
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
          p {
            margin-top: 1em;
          }
          p:first-child {
            margin-top: 0;
          }
        `}</style>
      </>
    );
  }
}

export default withRouter(MultiSigForm);
