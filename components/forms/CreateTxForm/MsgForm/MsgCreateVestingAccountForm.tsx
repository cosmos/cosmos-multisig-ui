import { EncodeObject } from "@cosmjs/proto-signing";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import {
  datetimeLocalFromTimestamp,
  timestampFromDatetimeLocal,
} from "../../../../lib/dateHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
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
  const { chain } = useChains();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [endTime, setEndTime] = useState(
    datetimeLocalFromTimestamp(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default is one month from now
  );
  const [delayed, setDelayed] = useState(true);

  const [toAddressError, setToAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [endTimeError, setEndTimeError] = useState("");

  const trimmedInputs = trimStringsObj({ toAddress, amount, endTime });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { toAddress, amount, endTime } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setToAddressError("");
      setAmountError("");
      setEndTimeError("");

      const addressErrorMsg = checkAddress(toAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setToAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
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

      const timeoutDate = new Date(Number(timestampFromDatetimeLocal(endTime, "ms")));
      if (timeoutDate <= new Date()) {
        setEndTimeError("End time must be a date in the future");
        return false;
      }

      return true;
    };

    const microCoin = (() => {
      try {
        if (!amount || amount === "0") {
          return null;
        }

        return displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch {
        return null;
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.CreateVestingAccount].fromPartial({
      fromAddress,
      toAddress,
      amount: microCoin ? [microCoin] : [],
      endTime: timestampFromDatetimeLocal(endTime, "s"),
      delayed,
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.CreateVestingAccount, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    delayed,
    fromAddress,
    setMsgGetter,
    trimmedInputs,
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
          onChange={({ target }) => {
            setToAddress(target.value);
            setToAddressError("");
          }}
          error={toAddressError}
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
      <div className="form-item">
        <Input
          type="datetime-local"
          label="End time"
          name="end-time"
          value={endTime}
          onChange={({ target }) => {
            setEndTime(target.value);
            setEndTimeError("");
          }}
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
