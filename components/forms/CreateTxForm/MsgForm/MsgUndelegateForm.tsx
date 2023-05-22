import { Decimal } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { isTxMsgUndelegate } from "../../../../lib/txMsgHelpers";
import { TxMsg, TxMsgUndelegate } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgUndelegateFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgUndelegateForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgUndelegateFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    try {
      assert(state.chain.denom, "denom missing");

      setValidatorAddressError("");
      setAmountError("");

      const isMsgValid = (msg: TxMsg): msg is TxMsgUndelegate => {
        assert(state.chain.addressPrefix, "addressPrefix missing");

        const addressErrorMsg = checkAddress(validatorAddress, state.chain.addressPrefix);
        if (addressErrorMsg) {
          setValidatorAddressError(
            `Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }

        return isTxMsgUndelegate(msg);
      };

      const amountInAtomics = Decimal.fromUserInput(
        amount || "0",
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

      setMsgGetter({ isMsgValid, msg });
    } catch {}
  }, [
    amount,
    delegatorAddress,
    setMsgGetter,
    state.chain.addressPrefix,
    state.chain.chainId,
    state.chain.denom,
    state.chain.displayDenomExponent,
    validatorAddress,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgUndelegate</h2>
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

export default MsgUndelegateForm;
