import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgDelegate = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const onCheck = props.onCheck || (() => {});
  const { state } = useAppContext();
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [delegatorAddressError, setDelegatorAddressError] = useState("");
  // const [amountError, setAmountError] = useState("");

  function checkMsg(msg, updateInternalErrors) {
    if (!msg) return false;
    if (!msg.typeUrl) return false;
    if (!msg.value) return false;

    const v = msg.value;
    if (!v.amount) return false;
    if (!v.amount.denom) return false;
    if (!v.amount.amount) return false;

    const toValidatorAddressError = checkAddress(
      v.validatorAddress,
      state.chain.addressPrefix + "valoper",
    );
    if (updateInternalErrors) {
      if (toValidatorAddressError) {
        const errorMsg = `Invalid validator address for network ${state.chain.chainId}: ${toValidatorAddressError}`;
        setValidatorAddressError(errorMsg);
      } else {
        setValidatorAddressError("");
      }
    }
    const toDelegatorAddressError = checkAddress(v.delegatorAddress, state.chain.addressPrefix);
    if (updateInternalErrors) {
      if (toDelegatorAddressError) {
        const errorMsg = `Invalid delegator address for network ${state.chain.chainId}: ${toDelegatorAddressError}`;
        setDelegatorAddressError(errorMsg);
      } else {
        setDelegatorAddressError("");
      }
    }
    if (toValidatorAddressError || toDelegatorAddressError) {
      return false;
    }

    return true;
  }

  function checkAndSetAmount(newAmount) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.amount.amount = newAmount;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  function checkAndSetValidatorAddress(valaddr) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.validatorAddress = valaddr;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  return (
    <div>
      <h2>Delegate</h2>
      <div className="form-item">
        <Input
          label="Delegator Address"
          name="delegatorAddress"
          value={props.msg.value.delegatorAddress}
          disabled={true}
          error={delegatorAddressError}
        />
      </div>
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
