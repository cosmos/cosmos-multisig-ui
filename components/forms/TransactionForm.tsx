import { Decimal } from "@cosmjs/math";
import { Account, calculateFee } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import axios from "axios";
import { NextRouter, withRouter } from "next/router";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";
import Button from "../inputs/Button";
import Input from "../inputs/Input";
import StackableContainer from "../layout/StackableContainer";

interface Props {
  address: string | null;
  accountOnChain: Account;
  router: NextRouter;
  closeForm: () => void;
}

const TransactionForm = (props: Props) => {
  const { state } = useAppContext();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(200000);
  const [gasPrice, _setGasPrice] = useState(state.chain.gasPrice);
  const [processing, setProcessing] = useState(false);
  const [addressError, setAddressError] = useState("");

  const createTransaction = (txToAddress: string, txAmount: string, gasLimit: number) => {
    assert(Number.isSafeInteger(gasLimit) && gasLimit > 0, "gas limit must be a positive integer");

    const amountInAtomics = Decimal.fromUserInput(
      txAmount,
      Number(state.chain.displayDenomExponent),
    ).atomics;
    const msgSend = {
      fromAddress: props.address,
      toAddress: txToAddress,
      amount: [
        {
          amount: amountInAtomics,
          denom: state.chain.denom,
        },
      ],
    };
    const msg = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: msgSend,
    };
    assert(gasPrice, "gasPrice missing");
    const fee = calculateFee(gasLimit, gasPrice);
    const { accountOnChain } = props;
    assert(typeof accountOnChain.accountNumber === "number", "accountNumber missing");
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
    const toAddressError = checkAddress(toAddress, state.chain.addressPrefix);
    if (toAddressError) {
      setAddressError(`Invalid address for network ${state.chain.chainId}: ${toAddressError}`);
      return;
    }

    setProcessing(true);
    const tx = createTransaction(toAddress, amount, gas);
    console.log(tx);
    const dataJSON = JSON.stringify(tx);
    const res = await axios.post("/api/transaction", { dataJSON });
    const { transactionID } = res.data;
    props.router.push(`${props.address}/transaction/${transactionID}`);
  };

  assert(state.chain.addressPrefix, "addressPrefix missing");

  return (
    <StackableContainer lessPadding>
      <button className="remove" onClick={() => props.closeForm()}>
        ✕
      </button>
      <h2>Create New transaction</h2>
      <div className="form-item">
        <Input
          label="To Address"
          name="toAddress"
          value={toAddress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}
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
      <Button label="Create Transaction" onClick={handleCreate} loading={processing} />
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

export default withRouter(TransactionForm);
