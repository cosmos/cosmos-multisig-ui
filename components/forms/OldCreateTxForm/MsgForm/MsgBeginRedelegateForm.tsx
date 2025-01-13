import SelectValidator from "@/components/SelectValidator";
import { MsgBeginRedelegateEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgBeginRedelegateFormProps {
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgBeginRedelegateForm = ({
  senderAddress,
  setMsgGetter,
  deleteMsg,
}: MsgBeginRedelegateFormProps) => {
  const { chain } = useChains();

  const [validatorSrcAddress, setValidatorSrcAddress] = useState("");
  const [validatorDstAddress, setValidatorDstAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorSrcAddressError, setValidatorSrcAddressError] = useState("");
  const [validatorDstAddressError, setValidatorDstAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({ validatorSrcAddress, validatorDstAddress, amount });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { validatorSrcAddress, validatorDstAddress, amount } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorSrcAddressError("");
      setValidatorDstAddressError("");
      setAmountError("");

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

      try {
        displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch (e: unknown) {
        setAmountError(e instanceof Error ? e.message : "Could not set decimals");
        return false;
      }

      return true;
    };

    const microCoin = (() => {
      try {
        return displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch {
        return { denom: chain.displayDenom, amount: "0" };
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.BeginRedelegate].fromPartial({
      delegatorAddress: senderAddress,
      validatorSrcAddress,
      validatorDstAddress,
      amount: microCoin,
    });

    const msg: MsgBeginRedelegateEncodeObject = {
      typeUrl: MsgTypeUrls.BeginRedelegate,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    senderAddress,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgBeginRedelegate</h2>
      <div className="form-item">
        <SelectValidator
          selectedValidatorAddress={validatorSrcAddress}
          setValidatorAddress={setValidatorSrcAddress}
        />
        <Input
          label="Source Validator Address"
          name="src-validator-address"
          value={validatorSrcAddress}
          onChange={({ target }) => {
            setValidatorSrcAddress(target.value);
            setValidatorSrcAddressError("");
          }}
          error={validatorSrcAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <SelectValidator
          selectedValidatorAddress={validatorDstAddress}
          setValidatorAddress={setValidatorDstAddress}
        />
        <Input
          label="Destination Validator Address"
          name="dst-validator-address"
          value={validatorDstAddress}
          onChange={({ target }) => {
            setValidatorDstAddress(target.value);
            setValidatorDstAddressError("");
          }}
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
          onChange={({ target }) => {
            setAmount(target.value);
            setAmountError("");
          }}
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

export default MsgBeginRedelegateForm;
