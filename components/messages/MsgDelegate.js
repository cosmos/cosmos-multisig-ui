import { Decimal } from "@cosmjs/math";
import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgDelegate = (props) => {
  const { state } = useAppContext();
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [msg, setMsg] = useState(props.msg);

  /*
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
  */

  function checkAndSetAmount(msgAmount) {
    if (!msg) return;
    if (!msg.value) return;

    const amountInAtomics = Decimal.fromUserInput(
      msgAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;

    const newMsg = JSON.parse(JSON.stringify(msg));
    newMsg.value.amount = {
      amount: amountInAtomics,
      denom: state.chain.denom,
    };
    setMsg(newMsg);
  }

  function checkAndSetValidatorAddress(valaddr) {
    if (!msg) return;
    if (!msg.value) return;

    const toValidatorAddressError = checkAddress(valaddr, state.chain.addressPrefix + "valoper");
    if (toValidatorAddressError) {
      setValidatorAddressError(
        `Invalid validator address for network ${state.chain.chainId}: ${toValidatorAddressError}`,
      );
      return;
    }

    const newMsg = JSON.parse(JSON.stringify(msg));
    newMsg.value.validatorAddress = valaddr;
    setMsg(newMsg);
  }

  return (
    <div>
      <h2>Create New Delegation</h2>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validatorAddress"
          value={msg.validatorAddress}
          onChange={(e) => checkAndSetValidatorAddress(e.target.value)}
          error={validatorAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix + "valoper")}`}
        />
      </div>
      <div className="form-item">
        <Input
          label={`Amount (${state.chain.displayDenom})`}
          name="amount"
          type="number"
          value={msg.value.amount.amount * Math.pow(10, parseInt(msg.value.amount.denom, 10))}
          onChange={(e) => checkAndSetAmount(e.target.value)}
        />
      </div>
      <style jsx>{`
        p {
          margin-top: 15px;
        }
        .form-item {
          margin-top: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default MsgDelegate;
