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

const VestingForm = (props) => {
  const { state } = useAppContext();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [unixEpochTime, setUnixEpochTime] = useState("0");
  const [delayed, setDelayed] = useState(true);
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [_processing, setProcessing] = useState(false);
  const [addressError, setAddressError] = useState("");

  const createTransaction = (txToAddress, txAmount, txGas, txTime, delayed) => {
    const amountInAtomics = Decimal.fromUserInput(
      txAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;
    const msgCreateVestingAccount = {
      fromAddress: props.address,
      toAddress: txToAddress,
      endTime: txTime,
      amount: [
        {
          amount: amountInAtomics,
          denom: state.chain.denom,
        },
      ],
      delayed: delayed,
    };
    const msg = {
      typeUrl: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
      value: msgCreateVestingAccount,
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
    const toAddressError = checkAddress(toAddress, state.chain.addressPrefix);
    if (toAddressError) {
      setAddressError(`Invalid address for network ${state.chain.chainId}: ${toAddressError}`);
      return;
    }

    setProcessing(true);
    const tx = createTransaction(toAddress, amount, gas, unixEpochTime, delayed);
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
      <h2>Create New Vesting Account</h2>
      <div className="form-item">
        <Input
          label="Recieving Address"
          name="toAddress"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          error={addressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
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
          label="Unix Epoch Time"
          name="unixEpochTime"
          type="number"
          value={unixEpochTime}
          onChange={(e) => setUnixEpochTime(e.target.value)}
        />
      </div>
      <div className="form-item">
        <Input
          label="Delayed"
          name="delayed"
          type="checkbox"
          value={delayed}
          onChange={(e) => {
            setDelayed(e.target.checked);
          }}
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
      <Button label="Create Vesting Account" onClick={handleCreate} />
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

export default withRouter(VestingForm);
