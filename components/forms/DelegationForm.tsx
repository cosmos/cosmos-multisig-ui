import { Decimal } from "@cosmjs/math";
import { Account, calculateFee } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { NextRouter, withRouter } from "next/router";
import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { checkAddress, exampleValidatorAddress } from "../../lib/displayHelpers";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  address: string | null;
  accountOnChain: Account | null;
  router: NextRouter;
  closeForm: () => void;
}

const DelegationForm = (props: Props) => {
  const { state } = useAppContext();
  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [_processing, setProcessing] = useState(false);
  const [addressError, setAddressError] = useState("");

  const createTransaction = (txValidatorAddress: string, txAmount: string, gasLimit: number) => {
    assert(Number.isSafeInteger(gasLimit) && gasLimit > 0, "gas limit must be a positive integer");

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
    assert(gasPrice, "gasPrice missing");
    const fee = calculateFee(gasLimit, gasPrice);
    const { accountOnChain } = props;
    assert(accountOnChain, "accountOnChain missing");
    return {
      accountNumber: accountOnChain.accountNumber,
      sequence: accountOnChain.sequence,
      chainId: state.chain.chainId,
      msgs: [msg],
      fee: fee,
      memo: memo,
    };
  };

  const handleCreate = async () => {
    assert(state.chain.addressPrefix, "addressPrefix missing");
    const validatorAddressError = checkAddress(validatorAddress, state.chain.addressPrefix);
    if (validatorAddressError) {
      setAddressError(
        `Invalid address for network ${state.chain.chainId}: ${validatorAddressError}`,
      );
      return;
    }

    setProcessing(true);
    const tx = createTransaction(validatorAddress, amount, gas);
    console.log(tx, "tx data");
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    console.log(dataJSON, "tx dataJSON", res);
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

  assert(state.chain.addressPrefix, "addressPrefix missing");

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create Delegation</h2>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validatorAddress"
          value={validatorAddress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValidatorAddress(e.target.value)}
          error={addressError}
          placeholder={`E.g. ${exampleValidatorAddress(0, state.chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label={`Amount (${state.chain.displayDenom})`}
          name="amount"
          type="number"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        />
      </div>
      <div className="form-item">
        <Input
          label="Gas Limit"
          name="gas"
          type="number"
          value={gas}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGas(parseInt(e.target.value, 10))
          }
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemo(e.target.value)}
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

export default withRouter(DelegationForm);
