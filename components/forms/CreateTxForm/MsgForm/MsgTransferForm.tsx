import { assert } from "@cosmjs/utils";
import Long from "long";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { isTxMsgTransfer } from "../../../../lib/txMsgHelpers";
import { TxMsg, TxMsgTransfer } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

const humanTimestampOptions = [
  { label: "12 hours from now", value: 12 * 60 * 60 * 1000 },
  { label: "1 day from now", value: 24 * 60 * 60 * 1000 },
  { label: "2 days from now", value: 2 * 24 * 60 * 60 * 1000 },
  { label: "3 days from now", value: 3 * 24 * 60 * 60 * 1000 },
  { label: "7 days from now", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "10 days from now", value: 10 * 24 * 60 * 60 * 1000 },
  { label: "2 weeks from now", value: 2 * 7 * 24 * 60 * 60 * 1000 },
  { label: "3 weeks from now", value: 3 * 7 * 24 * 60 * 60 * 1000 },
  { label: "1 month from now", value: 4 * 7 * 24 * 60 * 60 * 1000 },
  { label: "custom", value: 0 },
];

type HumanTimestampOption = (typeof humanTimestampOptions)[number];

interface MsgTransferFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgTransferForm = ({ fromAddress, setMsgGetter, deleteMsg }: MsgTransferFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [sourcePort, setSourcePort] = useState("transfer");
  const [sourceChannel, setSourceChannel] = useState("");
  const [denom, setDenom] = useState("");
  const [amount, setAmount] = useState("0");
  const [toAddress, setToAddress] = useState("");
  const [selectedTimestamp, setSelectedTimestamp] = useState<HumanTimestampOption>(
    humanTimestampOptions[0],
  );
  const [customTimestamp, setCustomTimestamp] = useState("");
  const [memo, setMemo] = useState("");

  const [sourcePortError, setSourcePortError] = useState("");
  const [sourceChannelError, setSourceChannelError] = useState("");
  const [denomError, setDenomError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [toAddressError, setToAddressError] = useState("");
  const [customTimestampError, setCustomTimestampError] = useState("");

  useEffect(() => {
    setSourcePortError("");
    setSourceChannelError("");
    setDenomError("");
    setAmountError("");
    setToAddressError("");
    setCustomTimestampError("");

    const isMsgValid = (msg: TxMsg): msg is TxMsgTransfer => {
      assert(state.chain.addressPrefix, "addressPrefix missing");

      if (!sourcePort) {
        setSourcePortError("Source port is required");
        return false;
      }

      if (!sourceChannel) {
        setSourceChannelError("Source channel is required");
        return false;
      }

      if (!denom) {
        setDenomError("Denom is required");
        return false;
      }

      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }

      const addressErrorMsg = checkAddress(toAddress, state.chain.addressPrefix);
      if (addressErrorMsg) {
        setToAddressError(`Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (selectedTimestamp.label === "custom") {
        if (!customTimestamp || isNaN(Number(customTimestamp))) {
          setCustomTimestampError("A timestamp is required");
          return false;
        }

        if (Number(customTimestamp) <= Date.now()) {
          setCustomTimestampError("Timestamp needs to be in the future");
          return false;
        }
      }

      return isTxMsgTransfer(msg);
    };

    const timeoutTimestamp =
      selectedTimestamp.label === "custom"
        ? Long.fromString(customTimestamp)
        : Long.fromNumber(Date.now() + selectedTimestamp.value, true).multiply(1_000_000); // In nanoseconds

    const msg: TxMsgTransfer = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sender: fromAddress,
        receiver: toAddress,
        token: { denom, amount },
        sourcePort,
        sourceChannel,
        timeoutTimestamp,
        memo,
      },
    };

    setMsgGetter({ isMsgValid, msg });
  }, [
    amount,
    customTimestamp,
    denom,
    fromAddress,
    memo,
    selectedTimestamp.label,
    selectedTimestamp.value,
    setMsgGetter,
    sourceChannel,
    sourcePort,
    state.chain.addressPrefix,
    state.chain.chainId,
    toAddress,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgTransfer</h2>
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
          label="Denom"
          name="denom"
          value={denom}
          onChange={({ target }) => setDenom(target.value)}
          error={denomError}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label="Amount"
          name="amount"
          value={amount}
          onChange={({ target }) => setAmount(target.value)}
          error={amountError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Source Port"
          name="source-port"
          value={sourcePort}
          onChange={({ target }) => setSourcePort(target.value)}
          error={sourcePortError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Source Channel"
          name="source-channel"
          value={sourceChannel}
          onChange={({ target }) => setSourceChannel(target.value)}
          error={sourceChannelError}
        />
      </div>
      <div className="form-item">
        <Select
          options={humanTimestampOptions}
          onChange={(option: HumanTimestampOption) => {
            setSelectedTimestamp(option);

            if (option.label !== "custom") {
              setCustomTimestamp("");
            }
          }}
          value={selectedTimestamp}
          name="chain-select"
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label="Custom Timestamp"
          name="custom-timestamp"
          disabled={selectedTimestamp.label !== "custom"}
          value={customTimestamp}
          onChange={({ target }) => setCustomTimestamp(target.value)}
          error={customTimestampError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Memo"
          name="memo"
          value={memo}
          onChange={({ target }) => setMemo(target.value)}
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

export default MsgTransferForm;
