import { Decimal } from "@cosmjs/math";
import { assert } from "@cosmjs/utils";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { isTxMsgRedelegate } from "../../../../lib/txMsgHelpers";
import { TxMsg, TxMsgRedelegate } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgRedelegateFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgRedelegateForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgRedelegateFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [validatorSrcAddress, setValidatorSrcAddress] = useState("");
  const [validatorDstAddress, setValidatorDstAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorSrcAddressError, setValidatorSrcAddressError] = useState("");
  const [validatorDstAddressError, setValidatorDstAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    try {
      assert(state.chain.denom, "denom missing");

      setValidatorSrcAddressError("");
      setValidatorDstAddressError("");
      setAmountError("");

      const isMsgValid = (msg: TxMsg): msg is TxMsgRedelegate => {
        assert(state.chain.addressPrefix, "addressPrefix missing");

        const srcAddressErrorMsg = checkAddress(validatorSrcAddress, state.chain.addressPrefix);
        if (srcAddressErrorMsg) {
          setValidatorSrcAddressError(
            `Invalid address for network ${state.chain.chainId}: ${srcAddressErrorMsg}`,
          );
          return false;
        }

        const dstAddressErrorMsg = checkAddress(validatorDstAddress, state.chain.addressPrefix);
        if (dstAddressErrorMsg) {
          setValidatorDstAddressError(
            `Invalid address for network ${state.chain.chainId}: ${dstAddressErrorMsg}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }

        return isTxMsgRedelegate(msg);
      };

      const amountInAtomics = Decimal.fromUserInput(
        amount || "0",
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
    validatorDstAddress,
    validatorSrcAddress,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgBeginRedelegate</h2>
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

export default MsgRedelegateForm;
