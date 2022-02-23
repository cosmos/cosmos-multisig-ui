import React, { useState, useEffect } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const MsgDelegate = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const onCheck = props.onCheck || (() => {});
  const { state } = useAppContext();
  const [fromAddressError, setFromAddressError] = useState("");
  const [toAddressError, setToAddressError] = useState("");
  // const [amountError, setAmountError] = useState("");

  function checkMsg(msg, updateInternalErrors) {
    if (!msg) return false;
    if (!msg.typeUrl) return false;
    if (!msg.value) return false;

    const v = msg.value;
    if (!v.amount) return false;
    if (!v.amount.denom) return false;
    if (!v.amount.amount) return false;

    const _fromAddressError = checkAddress(v.delegatorAddress, state.chain.addressPrefix);
    if (updateInternalErrors) {
      if (_fromAddressError) {
        const errorMsg = `Invalid from address for network ${state.chain.chainId}: ${_fromAddressError}`;
        setFromAddressError(errorMsg);
      } else {
        setFromAddressError("");
      }
    }
    const _toAddressError = checkAddress(v.validatorAddress, state.chain.addressPrefix);
    if (updateInternalErrors) {
      if (_toAddressError) {
        const errorMsg = `Invalid to address for network ${state.chain.chainId}: ${_toAddressError}`;
        setToAddressError(errorMsg);
      } else {
        setToAddressError("");
      }
    }
    if (_toAddressError || _fromAddressError) {
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

  function checkAndSetToAddress(valaddr) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.validatorAddress = valaddr;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  useEffect(() => {
    onCheck(checkMsg(props.msg, false));
  }, []);

  return (
    <div>
      <h2>Send</h2>
      <div className="form-item">
        <Input
          label="From Address"
          name="fromAddress"
          value={props.msg.value.fromAddress}
          disabled={true}
          error={fromAddressError}
        />
      </div>
      <div className="form-item">
        <Input
          label="To Address"
          name="toAddress"
          value={props.msg.value.toAddress}
          onChange={(e) => checkAndSetToAddress(e.target.value)}
          error={toAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label={`Amount (${props.msg.value.amount.denom})`}
          name="amount"
          type="number"
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
