import SelectValidator from "@/components/SelectValidator";
import { MsgUndelegateEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
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
  const { chain } = useChains();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({ validatorAddress, amount });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { validatorAddress, amount } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorAddressError("");
      setAmountError("");

      const addressErrorMsg = checkAddress(validatorAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setValidatorAddressError(
          `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
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

    const msgValue = MsgCodecs[MsgTypeUrls.Undelegate].fromPartial({
      delegatorAddress,
      validatorAddress,
      amount: microCoin,
    });

    const msg: MsgUndelegateEncodeObject = { typeUrl: MsgTypeUrls.Undelegate, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    delegatorAddress,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgUndelegate</h2>
      <div className="form-item">
        <SelectValidator
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
        />
        <Input
          label="Validator Address"
          name="validator-address"
          value={validatorAddress}
          onChange={({ target }) => {
            setValidatorAddress(target.value);
            setValidatorAddressError("");
          }}
          error={validatorAddressError}
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

export default MsgUndelegateForm;
