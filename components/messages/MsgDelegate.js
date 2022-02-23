import { Decimal } from "@cosmjs/math";
import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgDelegate = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const { state } = useAppContext();
  const [validatorAddressError, setValidatorAddressError] = useState("");

  function checkAndSetAmount(newAmount) {
    if (!props.msg) return;
    if (!props.msg.value) return;

    /*
    const amountInAtomics = Decimal.fromUserInput(
      msgAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;
    */

    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.amount.amount = newAmount;
    onMsgChange(newMsg);
  }

  function checkAndSetValidatorAddress(valaddr) {
    if (!props.msg) return;
    if (!props.msg.value) return;

    const toValidatorAddressError = checkAddress(valaddr, state.chain.addressPrefix + "valoper");
    if (toValidatorAddressError) {
      setValidatorAddressError(
        `Invalid validator address for network ${state.chain.chainId}: ${toValidatorAddressError}`,
      );
    }

    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.validatorAddress = valaddr;
    onMsgChange(newMsg);
  }

  return (
    <div>
      <h2>Create New Delegation</h2>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validatorAddress"
          value={props.msg.value.validatorAddress}
          onChange={(e) => checkAndSetValidatorAddress(e.target.value)}
          error={validatorAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix + "valoper")}`}
        />
      </div>
      <div className="form-item">
        <Input
          label={`Amount (${props.msg.value.amount.denom})`}
          name="amount"
          type="select"
          value={props.msg.value.amount.amount}
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
