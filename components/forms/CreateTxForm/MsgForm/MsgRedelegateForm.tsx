import { Decimal } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { TxMsg, TxMsgRedelegate } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";

interface MsgRedelegateFormProps {
  readonly delegatorAddress: string;
  readonly setCheckAndGetMsg: Dispatch<SetStateAction<(() => TxMsg | null) | undefined>>;
}

const MsgRedelegateForm = ({ delegatorAddress, setCheckAndGetMsg }: MsgRedelegateFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [validatorSrcAddress, setValidatorSrcAddress] = useState("");
  const [validatorDstAddress, setValidatorDstAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorSrcAddressError, setValidatorSrcAddressError] = useState("");
  const [validatorDstAddressError, setValidatorDstAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const checkAndGetMsg = useCallback(() => {
    assert(state.chain.addressPrefix, "addressPrefix missing");
    assert(state.chain.denom, "denom missing");

    const srcAddressErrorMsg = checkAddress(validatorSrcAddress, state.chain.addressPrefix);
    if (srcAddressErrorMsg) {
      setValidatorSrcAddressError(
        `Invalid address for network ${state.chain.chainId}: ${srcAddressErrorMsg}`,
      );
      return null;
    }

    const dstAddressErrorMsg = checkAddress(validatorDstAddress, state.chain.addressPrefix);
    if (dstAddressErrorMsg) {
      setValidatorDstAddressError(
        `Invalid address for network ${state.chain.chainId}: ${dstAddressErrorMsg}`,
      );
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

    const msg: TxMsgRedelegate = {
      typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
      value: {
        delegatorAddress,
        validatorSrcAddress,
        validatorDstAddress,
        amount: { amount: amountInAtomics, denom: state.chain.denom },
      },
    };

    return msg;
  }, [
    amount,
    delegatorAddress,
    state.chain.addressPrefix,
    state.chain.chainId,
    state.chain.denom,
    state.chain.displayDenomExponent,
    validatorDstAddress,
    validatorSrcAddress,
  ]);

  useEffect(() => {
    setCheckAndGetMsg(() => checkAndGetMsg);
  }, [checkAndGetMsg, setCheckAndGetMsg]);

  return (
    <>
      <div className="form-item">
        <Input
          label="Source Validator Address"
          name="src-validator-address"
          value={validatorSrcAddress}
          onChange={({ target }) => setValidatorSrcAddress(target.value)}
          error={validatorSrcAddressError}
          placeholder={`E.g. ${exampleAddress(0, state.chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="Destination Validator Address"
          name="dst-validator-address"
          value={validatorDstAddress}
          onChange={({ target }) => setValidatorDstAddress(target.value)}
          error={validatorDstAddressError}
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

export default MsgRedelegateForm;
