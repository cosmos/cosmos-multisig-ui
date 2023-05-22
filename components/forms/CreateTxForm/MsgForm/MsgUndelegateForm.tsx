import { Decimal } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { TxMsg, TxMsgUndelegate } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";

interface MsgUndelegateFormProps {
  readonly delegatorAddress: string;
  readonly setCheckAndGetMsg: Dispatch<SetStateAction<(() => TxMsg | null) | undefined>>;
}

const MsgUndelegateForm = ({ delegatorAddress, setCheckAndGetMsg }: MsgUndelegateFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const checkAndGetMsg = useCallback(() => {
    assert(state.chain.addressPrefix, "addressPrefix missing");
    assert(state.chain.denom, "denom missing");

    const addressErrorMsg = checkAddress(validatorAddress, state.chain.addressPrefix);
    if (addressErrorMsg) {
      setValidatorAddressError(
        `Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`,
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

    const msg: TxMsgUndelegate = {
      typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
      value: {
        delegatorAddress,
        validatorAddress,
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
    validatorAddress,
  ]);

  useEffect(() => {
    setCheckAndGetMsg(() => checkAndGetMsg);
  }, [checkAndGetMsg, setCheckAndGetMsg]);

  return (
    <>
      <div className="form-item">
        <Input
          label="Validator Address"
          name="validator-address"
          value={validatorAddress}
          onChange={({ target }) => setValidatorAddress(target.value)}
          error={validatorAddressError}
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

export default MsgUndelegateForm;
