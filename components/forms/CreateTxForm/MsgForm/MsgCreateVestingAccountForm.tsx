import { Decimal } from "@cosmjs/math";
import { EncodeObject } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { timestampFromDatetimeLocal } from "../../../../lib/dateHelpers";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

/*
  One month from now
  With stripped seconds and milliseconds
  Matching the crazy datetime-local input format
*/
const getMinEndTime = (): string => {
  const minTimestamp = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const minDate = new Date(minTimestamp);

  const minMonth = minDate.getMonth() + 1; // It's 0-indexed
  const minMonthStr = minMonth < 10 ? `0${minMonth}` : String(minMonth);

  const minDay = minDate.getDate();
  const minDayStr = minDay < 10 ? `0${minDay}` : String(minDay);

  const minHours = minDate.getHours();
  const minHoursStr = minHours < 10 ? `0${minHours}` : String(minHours);

  const minMinutes = minDate.getMinutes();
  const minMinutesStr = minMinutes < 10 ? `0${minMinutes}` : String(minMinutes);

  return `${minDate.getFullYear()}-${minMonthStr}-${minDayStr}T${minHoursStr}:${minMinutesStr}`;
};

interface MsgCreateVestingAccountFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgCreateVestingAccountForm = ({
  fromAddress,
  setMsgGetter,
  deleteMsg,
}: MsgCreateVestingAccountFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const minEndTime = getMinEndTime();
  const [endTime, setEndTime] = useState(minEndTime);
  const [delayed, setDelayed] = useState(true);

  const [toAddressError, setToAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [endTimeError, setEndTimeError] = useState("");

  useEffect(() => {
    try {
      assert(state.chain.denom, "denom missing");

      setToAddressError("");
      setAmountError("");
      setEndTimeError("");

      const isMsgValid = (): boolean => {
        assert(state.chain.addressPrefix, "addressPrefix missing");

        const addressErrorMsg = checkAddress(toAddress, state.chain.addressPrefix);
        if (addressErrorMsg) {
          setToAddressError(
            `Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }

        if (!endTime) {
          setEndTimeError("End time is required");
          return false;
        }

        return true;
      };

      const amountInAtomics = amount
        ? Decimal.fromUserInput(amount, Number(state.chain.displayDenomExponent)).atomics
        : "0";

      const msgValue: MsgCreateVestingAccount = {
        fromAddress,
        toAddress,
        amount: [{ amount: amountInAtomics, denom: state.chain.denom }],
        endTime: timestampFromDatetimeLocal(endTime),
        delayed,
      };

      const msg: EncodeObject = { typeUrl: MsgTypeUrls.CreateVestingAccount, value: msgValue };

      setMsgGetter({ isMsgValid, msg });
    } catch {}
  }, [
    amount,
    delayed,
    endTime,
    fromAddress,
    setMsgGetter,
    state.chain.addressPrefix,
    state.chain.chainId,
    state.chain.denom,
    state.chain.displayDenomExponent,
    toAddress,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgCreateVestingAccount</h2>
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
      <div className="form-item">
        <Input
          type="datetime-local"
          label="End time"
          name="end-time"
          value={endTime}
          min={minEndTime}
          onChange={({ target }) => setEndTime(target.value)}
          error={endTimeError}
        />
      </div>
      <div className="form-item">
        <Input
          type="checkbox"
          label="Delayed"
          name="delayed"
          checked={delayed}
          value={String(delayed)}
          onChange={({ target }) => setDelayed(target.checked)}
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

export default MsgCreateVestingAccountForm;
