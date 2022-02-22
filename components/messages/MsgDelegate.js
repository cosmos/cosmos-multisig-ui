import { Decimal } from "@cosmjs/math";
import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgDelegate = (props) => {
  const { state } = useAppContext();
  const [validatorAddress, setValidatorAddress] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [amount, setAmount] = useState("0");

  const createDelegationMsg = (txValidatorAddress, txAmount) => {
    const amountInAtomics = Decimal.fromUserInput(
      txAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;
    const msgDelegate = {
      delegatorAddress: props.address,
      validatorAddress: txValidatorAddress,
      amount: {
        amount: amountInAtomics,
        denom: state.chain.denom,
      },
    };
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: msgDelegate,
    };
  };

  const handleCreate = async () => {
    const toValidatorAddressError = checkAddress(
      validatorAddress,
      state.chain.addressPrefix + "valoper",
    );
    if (toValidatorAddressError) {
      setValidatorAddressError(
        `Invalid validator address for network ${state.chain.chainId}: ${toValidatorAddressError}`,
      );
      return;
    }

    const msg = createDelegationMsg(validatorAddress, amount);

    props.onCreate(msg);
    props.closeForm();
  };

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create New Delegation</h2>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validatorAddress"
          value={validatorAddress}
          onChange={(e) => setValidatorAddress(e.target.value)}
          error={validatorAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix + "valoper")}`}
        />
      </div>
      <div className="form-item">
        <Input
          label={`Amount (${state.chain.displayDenom})`}
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button label="Delegate" onClick={handleCreate} />
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
};

export default MsgDelegate;
