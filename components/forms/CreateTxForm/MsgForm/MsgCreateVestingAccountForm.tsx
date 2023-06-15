import { Decimal } from "@cosmjs/math";
import { EncodeObject } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import {
  datetimeLocalFromTimestamp,
  timestampFromDatetimeLocal,
} from "../../../../lib/dateHelpers";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

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
  const [endTime, setEndTime] = useState(
    datetimeLocalFromTimestamp(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default is one month from now
  );
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

        const timeoutDate = new Date(timestampFromDatetimeLocal(endTime).toNumber());
        if (timeoutDate <= new Date()) {
          setEndTimeError("End time must be a date in the future");
          return false;
        }

        return true;
      };

      const amountInAtomics = amount
        ? Decimal.fromUserInput(amount, Number(state.chain.displayDenomExponent)).atomics
        : "0";

      const msgValue = MsgCodecs[MsgTypeUrls.CreateVestingAccount].fromPartial({
        fromAddress,
        toAddress,
        amount: [{ amount: amountInAtomics, denom: state.chain.denom }],
        endTime: timestampFromDatetimeLocal(endTime, "s"),
        delayed,
      });

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
