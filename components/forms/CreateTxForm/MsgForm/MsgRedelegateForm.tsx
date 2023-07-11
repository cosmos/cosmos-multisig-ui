import { Decimal } from "@cosmjs/math";
import { EncodeObject } from "@cosmjs/proto-signing";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
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
  const { chain } = useChains();

  const [validatorSrcAddress, setValidatorSrcAddress] = useState("");
  const [validatorDstAddress, setValidatorDstAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorSrcAddressError, setValidatorSrcAddressError] = useState("");
  const [validatorDstAddressError, setValidatorDstAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    try {
      setValidatorSrcAddressError("");
      setValidatorDstAddressError("");
      setAmountError("");

      const isMsgValid = (): boolean => {
        const srcAddressErrorMsg = checkAddress(validatorSrcAddress, chain.addressPrefix);
        if (srcAddressErrorMsg) {
          setValidatorSrcAddressError(
            `Invalid address for network ${chain.chainId}: ${srcAddressErrorMsg}`,
          );
          return false;
        }

        const dstAddressErrorMsg = checkAddress(validatorDstAddress, chain.addressPrefix);
        if (dstAddressErrorMsg) {
          setValidatorDstAddressError(
            `Invalid address for network ${chain.chainId}: ${dstAddressErrorMsg}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }

        return true;
      };

      const amountInAtomics = Decimal.fromUserInput(
        amount || "0",
        Number(chain.displayDenomExponent),
      ).atomics;

      const msgValue = MsgCodecs[MsgTypeUrls.BeginRedelegate].fromPartial({
        delegatorAddress,
        validatorSrcAddress,
        validatorDstAddress,
        amount: { amount: amountInAtomics, denom: chain.denom },
      });

      const msg: EncodeObject = { typeUrl: MsgTypeUrls.BeginRedelegate, value: msgValue };

      setMsgGetter({ isMsgValid, msg });
    } catch {}
  }, [
    amount,
    chain.addressPrefix,
    chain.chainId,
    chain.denom,
    chain.displayDenomExponent,
    delegatorAddress,
    setMsgGetter,
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
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="Destination Validator Address"
          name="dst-validator-address"
          value={validatorDstAddress}
          onChange={({ target }) => setValidatorDstAddress(target.value)}
          error={validatorDstAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label={`Amount (${chain.displayDenom})`}
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
