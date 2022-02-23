import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgRedelegate = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const onCheck = props.onCheck || (() => {});
  const { state } = useAppContext();
  const [delegatorAddressError, setDelegatorAddressError] = useState("");
  const [validatorSrcAddressError, setValidatorSrcAddressError] = useState("");
  const [validatorDstAddressError, setValidatorDstAddressError] = useState("");
  // const [amountError, setAmountError] = useState("");

  function checkMsg(msg, updateInternalErrors) {
    setValidatorDstAddressError("");
    setDelegatorAddressError("");

    if (!msg) return false;
    if (!msg.typeUrl) return false;
    if (!msg.value) return false;

    const v = msg.value;
    if (!v.amount) return false;
    if (!v.amount.denom) return false;
    if (!v.amount.amount) return false;

    const toValidatorSrcAddressError = checkAddress(
      v.validatorSrcAddress,
      state.chain.addressPrefix + "valoper",
    );
    if (updateInternalErrors) {
      if (toValidatorSrcAddressError) {
        const errorMsg = `Invalid validator source address for network ${state.chain.chainId}: ${toValidatorSrcAddressError}`;
        setValidatorSrcAddressError(errorMsg);
      } else {
        setValidatorSrcAddressError("");
      }
    }
    const toValidatorDstAddressError = checkAddress(
      v.validatorDstAddress,
      state.chain.addressPrefix + "valoper",
    );
    if (updateInternalErrors) {
      if (toValidatorDstAddressError) {
        const errorMsg = `Invalid validator destination address for network ${state.chain.chainId}: ${toValidatorDstAddressError}`;
        setValidatorDstAddressError(errorMsg);
      } else {
        setValidatorDstAddressError("");
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
    if (toValidatorSrcAddressError || toValidatorDstAddressError || toDelegatorAddressError) {
      return false;
    }

    return true;
  }
  setTimeout(() => onCheck(checkMsg(props.msg, false)), 1);

  function checkAndSetAmount(newAmount) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.amount.amount = newAmount;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  function checkAndSetValidatorSrcAddress(valaddr) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.validatorSrcAddress = valaddr;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  function checkAndSetValidatorDstAddress(valaddr) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.validatorDstAddress = valaddr;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  return (
    <div>
      <h2>Redelegate</h2>
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
          label="Validator Source Address"
          name="validatorSrcAddress"
          value={props.msg.value.validatorSrcAddress}
          onChange={(e) => checkAndSetValidatorSrcAddress(e.target.value)}
          error={validatorSrcAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix + "valoper")}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="Validator Destination Address"
          name="validatorDstAddress"
          value={props.msg.value.validatorDstAddress}
          onChange={(e) => checkAndSetValidatorDstAddress(e.target.value)}
          error={validatorDstAddressError}
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

export default MsgRedelegate;
