import React, { useState } from "react";
import { withRouter, NextRouter } from "next/router";
import { StargateClient } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";

import { useAppContext } from "../../context/AppContext";
import Button from "../inputs/Button";
import { createMultisigFromCompressedSecp256k1Pubkeys } from "../../lib/multisigHelpers";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import ThresholdInput from "../inputs/ThresholdInput";
import { exampleAddress, examplePubkey } from "../../lib/displayHelpers";

const emptyPubKeyGroup = () => {
  return { address: "", compressedPubkey: "", keyError: "", isPubkey: false };
};

interface Props {
  router: NextRouter;
}

const MultiSigForm = (props: Props) => {
  const { state } = useAppContext();
  const [pubkeys, setPubkeys] = useState([emptyPubKeyGroup(), emptyPubKeyGroup()]);
  const [threshold, setThreshold] = useState(2);
  const [_processing, setProcessing] = useState(false);

  const handleChangeThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newThreshold = parseInt(e.target.value, 10);
    if (newThreshold > pubkeys.length || newThreshold <= 0) {
      newThreshold = threshold;
    }
    setThreshold(newThreshold);
  };

  const handleKeyGroupChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const tempPubkeys = [...pubkeys];
    if (e.target.name === "compressedPubkey") {
      tempPubkeys[index].compressedPubkey = e.target.value;
    } else if (e.target.name === "address") {
      tempPubkeys[index].address = e.target.value;
    }
    setPubkeys(tempPubkeys);
  };

  const handleAddKey = () => {
    const tempPubkeys = [...pubkeys];
    setPubkeys(tempPubkeys.concat(emptyPubKeyGroup()));
  };

  const handleRemove = (index: number) => {
    const tempPubkeys = [...pubkeys];
    const oldLength = tempPubkeys.length;
    tempPubkeys.splice(index, 1);
    const newThreshold = threshold > tempPubkeys.length ? tempPubkeys.length : oldLength;
    setPubkeys(tempPubkeys);
    setThreshold(newThreshold);
  };

  const getPubkeyFromNode = async (address: string) => {
    assert(state.chain.nodeAddress, "nodeAddress missing");
    const client = await StargateClient.connect(state.chain.nodeAddress);
    const accountOnChain = await client.getAccount(address);
    console.log(accountOnChain);
    if (!accountOnChain || !accountOnChain.pubkey) {
      throw new Error(
        "Account has no pubkey on chain, this address will need to send a transaction to appear on chain.",
      );
    }
    return accountOnChain.pubkey.value;
  };

  const handleKeyBlur = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const tempPubkeys = [...pubkeys];
      let pubkey;
      // use pubkey
      console.log(tempPubkeys[index]);
      if (tempPubkeys[index].isPubkey) {
        pubkey = e.target.value;
        if (pubkey.length !== 44) {
          throw new Error("Invalid Secp256k1 pubkey");
        }
      } else {
        // use address to fetch pubkey
        const address = e.target.value;
        if (address.length > 0) {
          pubkey = await getPubkeyFromNode(address);
        }
      }

      tempPubkeys[index].compressedPubkey = pubkey;
      tempPubkeys[index].keyError = "";
      setPubkeys(tempPubkeys);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      const tempPubkeys = [...pubkeys];
      tempPubkeys[index].keyError = error.message;
      setPubkeys(tempPubkeys);
    }
  };

  const handleCreate = async () => {
    setProcessing(true);
    const compressedPubkeys = pubkeys.map((item) => item.compressedPubkey);
    let multisigAddress;
    try {
      assert(state.chain.addressPrefix, "addressPrefix missing");
      assert(state.chain.chainId, "chainId missing");
      multisigAddress = await createMultisigFromCompressedSecp256k1Pubkeys(
        compressedPubkeys,
        threshold,
        state.chain.addressPrefix,
        state.chain.chainId,
      );
      props.router.push(`/multi/${multisigAddress}`);
    } catch (error) {
      console.log("Failed to creat multisig: ", error);
    }
  };

  const togglePubkey = (index: number) => {
    const tempPubkeys = [...pubkeys];
    tempPubkeys[index].isPubkey = !tempPubkeys[index].isPubkey;
    setPubkeys(tempPubkeys);
  };

  return (
    <>
      <StackableContainer>
        <StackableContainer lessPadding>
          <p>Add the addresses that will make up this multisig.</p>
        </StackableContainer>
        {pubkeys.map((pubkeyGroup, index) => {
          assert(state.chain.addressPrefix, "addressPrefix missing");
          return (
            <StackableContainer lessPadding lessMargin key={index}>
              <div className="key-row">
                {pubkeys.length > 2 && (
                  <button
                    className="remove"
                    onClick={() => {
                      handleRemove(index);
                    }}
                  >
                    ✕
                  </button>
                )}
                <div className="key-inputs">
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleKeyGroupChange(index, e);
                    }}
                    value={
                      pubkeyGroup.isPubkey ? pubkeyGroup.compressedPubkey : pubkeyGroup.address
                    }
                    label={pubkeyGroup.isPubkey ? "Public Key (Secp256k1)" : "Address"}
                    name={pubkeyGroup.isPubkey ? "compressedPubkey" : "address"}
                    width="100%"
                    placeholder={`E.g. ${
                      pubkeyGroup.isPubkey
                        ? examplePubkey(index)
                        : exampleAddress(index, state.chain.addressPrefix)
                    }`}
                    error={pubkeyGroup.keyError}
                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleKeyBlur(index, e);
                    }}
                  />
                  <button className="toggle-type" onClick={() => togglePubkey(index)}>
                    Use {pubkeyGroup.isPubkey ? "Address" : "Public Key"}
                  </button>
                </div>
              </div>
            </StackableContainer>
          );
        })}

        <Button label="Add another address" onClick={() => handleAddKey()} />
      </StackableContainer>
      <StackableContainer>
        <StackableContainer lessPadding>
          <ThresholdInput
            onChange={handleChangeThreshold}
            value={threshold}
            total={pubkeys.length}
          />
        </StackableContainer>

        <StackableContainer lessPadding lessMargin>
          <p>
            This means that each transaction this multisig makes will require {threshold} of the
            members to sign it for it to be accepted by the validators.
          </p>
        </StackableContainer>
      </StackableContainer>
      <Button primary onClick={handleCreate} label="Create Multisig" />
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
};

export default withRouter(MultiSigForm);
