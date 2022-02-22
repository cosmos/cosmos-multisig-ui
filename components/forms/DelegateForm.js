import axios from "axios";
import { calculateFee } from "@cosmjs/stargate";
import { Decimal } from "@cosmjs/math";
import React, { useState } from "react";
import { withRouter } from "next/router";

import { useAppContext } from "../../context/AppContext";
import Button from "../../components/inputs/Button";
import Input from "../../components/inputs/Input";
import StackableContainer from "../layout/StackableContainer";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

const DelegateForm = (props) => {
  const { state } = useAppContext();
  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [_processing, setProcessing] = useState(false);
  const [validatorAddressError, setValidatorAddressError] = useState("");

  const createDelegation = (txValidatorAddress, txAmount, txGas) => {
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
    const msg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: msgDelegate,
    };
    const fee = calculateFee(Number(txGas), gasPrice);
    return {
      accountNumber: props.accountOnChain.accountNumber,
      sequence: props.accountOnChain.sequence,
      chainId: state.chain.chainId,
      msgs: [msg],
      fee: fee,
      memo: memo,
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

    setProcessing(true);

    const tx = createDelegation(validatorAddress, amount, gas);
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create New transaction</h2>
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
      <div className="form-item">
        <Input
          label="Gas Limit"
          name="gas"
          type="number"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
        />
      </div>
      <div className="form-item">
        <Input label="Gas Price" name="gas_price" type="string" value={gasPrice} disabled={true} />
      </div>
      <div className="form-item">
        <Input
          label="Memo"
          name="memo"
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
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

export default withRouter(DelegateForm);
