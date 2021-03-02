import axios from "axios";
import React from "react";
import { withRouter } from "next/router";

import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import ThresholdInput from "../inputs/ThresholdInput";

const emptyPubKeyGroup = () => {
  return { pubkey: "", nickname: "", keyError: "" };
};

class MultiSigForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pubkeys: [emptyPubKeyGroup(), emptyPubKeyGroup()],
      key: "",
      nickname: "",
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
            <StackableContainer lessPadding lessMargin>
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
                    value={this.state.pubkeys[index].nickname}
                    label="Nickname"
                    name="nickname"
                    width="30%"
                  />
                  <Input
                    onChange={(e) => {
                      this.handleKeyGroupChange(index, e);
                    }}
                    value={this.state.pubkeys[index].key}
                    label="Public Key"
                    name="key"
                    width="65%"
                    error={this.state.pubkeys[index].keyError}
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
