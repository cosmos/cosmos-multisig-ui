import { Decimal } from "@cosmjs/math";
import { MsgUndelegateEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
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

  useEffect(() => {
    try {
      setValidatorAddressError("");
      setAmountError("");

      const isMsgValid = (): boolean => {
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

        return true;
      };

      const amountInAtomics = Decimal.fromUserInput(
        amount || "0",
        Number(chain.displayDenomExponent),
      ).atomics;

      const msgValue = MsgCodecs[MsgTypeUrls.Undelegate].fromPartial({
        delegatorAddress,
        validatorAddress,
        amount: { amount: amountInAtomics, denom: chain.denom },
      });

      const msg: MsgUndelegateEncodeObject = { typeUrl: MsgTypeUrls.Undelegate, value: msgValue };

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

export default MsgUndelegateForm;
