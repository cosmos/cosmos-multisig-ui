import { Decimal } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { TxMsg, TxMsgSend } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";

interface MsgSendFormProps {
  readonly fromAddress: string;
  readonly setCheckAndGetMsg: Dispatch<SetStateAction<(() => TxMsg | null) | undefined>>;
}

const MsgSendForm = ({ fromAddress, setCheckAndGetMsg }: MsgSendFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [toAddressError, setToAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const checkAndGetMsg = useCallback(() => {
    assert(state.chain.addressPrefix, "addressPrefix missing");
    assert(state.chain.denom, "denom missing");

    const addressErrorMsg = checkAddress(toAddress, state.chain.addressPrefix);
    if (addressErrorMsg) {
      setToAddressError(`Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`);
      return null;
    }

    if (!amount || Number(amount) <= 0) {
      setAmountError("Amount must be greater than 0");
      return null;
    }

    const amountInAtomics = Decimal.fromUserInput(
      amount,
      Number(state.chain.displayDenomExponent),
    ).atomics;

    const msg: TxMsgSend = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress,
        toAddress,
        amount: [{ amount: amountInAtomics, denom: state.chain.denom }],
      },
    };

    return msg;
  }, [
    amount,
    fromAddress,
    state.chain.addressPrefix,
    state.chain.chainId,
    state.chain.denom,
    state.chain.displayDenomExponent,
    toAddress,
  ]);

  useEffect(() => {
    setCheckAndGetMsg(() => checkAndGetMsg);
  }, [checkAndGetMsg, setCheckAndGetMsg]);

  return (
    <>
      <div className="form-item">
        <Input
          label="Recipient Address"
          name="recipient-address"
          value={toAddress}
          onChange={({ target }) => setToAddress(target.value)}
          error={toAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label={`Amount (${state.chain.displayDenom})`}
          name="amount"
          value={amount}
          onChange={({ target }) => setAmount(target.value)}
          error={amountError}
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
    </>
  );
};

export default MsgSendForm;
