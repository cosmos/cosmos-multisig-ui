import axios from "axios";
import React from "react";
import { withRouter } from "next/router";
import { StargateClient } from "@cosmjs/stargate";

import Button from "../inputs/Button";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../lib/multisigHelpers";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import ThresholdInput from "../inputs/ThresholdInput";

let emptyPubKeyGroup = () => {
  return { address: "", compressedPubkey: "", keyError: "", isPubkey: false };
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

  getPubkeyFromNode = async (address) => {
    const nodeAddress = process.env.NEXT_PUBLIC_NODE_ADDRESS;
    const client = await StargateClient.connect(nodeAddress);
    const accountOnChain = await client.getAccount(address);
    console.log(accountOnChain);
    if (!accountOnChain || !accountOnChain.pubkey) {
      throw new Error(
        "Account has no pubkey on chain, this address will need to send a transaction to appear on chain."
      );
    }
    return accountOnChain.pubkey.value;
  };

  handleKeyBlur = async (index, e) => {
    try {
      const { pubkeys } = this.state;
      let pubkey;
      // use pubkey
      console.log(pubkeys[index]);
      if (pubkeys[index].isPubkey) {
        pubkey = e.target.value;
        if (pubkey.length !== 44) {
          throw new Error("Invalid Secp256k1 pubkey");
        }
      } else {
        // use address to fetch pubkey
        let address = e.target.value;
        if (address.length > 0) {
          pubkey = await this.getPubkeyFromNode(address);
        }
      }

      pubkeys[index].compressedPubkey = pubkey;
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

  togglePubkey = (index) => {
    const { pubkeys } = this.state;
    pubkeys[index].isPubkey = !pubkeys[index].isPubkey;
    this.setState({ pubkeys });
  };

  render() {
    return (
      <>
        <StackableContainer>
          <StackableContainer lessPadding>
            <p>Add the addresses that will make up this multisig.</p>
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
                    value={
                      pubkeyGroup.isPubkey
                        ? pubkeyGroup.compressedPubkey
                        : pubkeyGroup.address
                    }
                    label={
                      pubkeyGroup.isPubkey
                        ? "Public Key (Secp256k1)"
                        : "Address"
                    }
                    name={pubkeyGroup.isPubkey ? "compressedPubkey" : "address"}
                    width="100%"
                    placeholder={
                      pubkeyGroup.isPubkey
                        ? "Akd/qKMWdZXyiMnSu6aFLpQEGDO0ijyal9mXUIcVaPNX"
                        : "cosmos1vqpjljwsynsn58dugz0w8ut7kun7t8ls2qkmsq"
                    }
                    error={pubkeyGroup.keyError}
                    onBlur={(e) => {
                      this.handleKeyBlur(index, e);
                    }}
                  />
                  <button
                    className="toggle-type"
                    onClick={() => this.togglePubkey(index)}
                  >
                    Use {pubkeyGroup.isPubkey ? "Address" : "Public Key"}
                  </button>
                </div>
              </div>
            </StackableContainer>
          ))}

          <Button label="Add another address" onClick={this.handleAddKey} />
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
            flex-direction: column;
            align-items: end;
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
          .toggle-type {
            margin-top: 10px;
            font-size: 12px;
            font-style: italic;
            border: none;
            background: none;
            color: white;
            text-decoration: underline;
          }
        `}</style>
      </>
    );
  }
}

export default withRouter(MultiSigForm);
