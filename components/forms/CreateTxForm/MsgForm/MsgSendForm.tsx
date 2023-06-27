import { Decimal } from "@cosmjs/math";
import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { ChainInfo } from "../../../../types";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

const customDenomOption = { label: "Custom (enter denom below)", value: "custom" } as const;

const getDenomOptions = (assets: ChainInfo["assets"]) => {
  if (!assets?.length) {
    return [customDenomOption];
  }

  return [...assets.map((asset) => ({ label: asset.symbol, value: asset })), customDenomOption];
};

interface MsgSendFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgSendForm = ({ fromAddress, setMsgGetter, deleteMsg }: MsgSendFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const denomOptions = getDenomOptions(state.chain.assets);

  const [toAddress, setToAddress] = useState("");
  const [selectedDenom, setSelectedDenom] = useState(denomOptions[0]);
  const [customDenom, setCustomDenom] = useState("");
  const [amount, setAmount] = useState("0");

  const [toAddressError, setToAddressError] = useState("");
  const [customDenomError, setCustomDenomError] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    assert(state.chain.denom, "denom missing");

    setToAddressError("");
    setCustomDenomError("");
    setAmountError("");

    const isMsgValid = (): boolean => {
      assert(state.chain.addressPrefix, "addressPrefix missing");

      const addressErrorMsg = checkAddress(toAddress, state.chain.addressPrefix);
      if (addressErrorMsg) {
        setToAddressError(`Invalid address for network ${state.chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (selectedDenom.value === customDenomOption.value && !customDenom) {
        setCustomDenomError("Custom denom must be set because of selection above");
        return false;
      }

      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }

      if (selectedDenom.value === customDenomOption.value && !Number.isInteger(Number(amount))) {
        setAmountError("Amount cannot be decimal for custom denom");
        return false;
      }

      return true;
    };

    const denom =
      selectedDenom.value === customDenomOption.value ? customDenom : selectedDenom.value.symbol;

    const amountInAtomics = (() => {
      try {
        if (selectedDenom.value === customDenomOption.value) {
          return Decimal.fromUserInput(amount, 0).atomics;
        }

        const foundAsset = state.chain.assets?.find((asset) => asset.symbol === denom);
        const exponent =
          foundAsset?.denom_units.find((unit) => unit.denom === foundAsset.symbol.toLowerCase())
            ?.exponent ?? 0;

        return Decimal.fromUserInput(amount, exponent).atomics;
      } catch {
        return "0";
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.Send].fromPartial({
      fromAddress,
      toAddress,
      amount: [{ denom, amount: amountInAtomics }],
    });

    const msg: MsgSendEncodeObject = { typeUrl: MsgTypeUrls.Send, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    amount,
    customDenom,
    fromAddress,
    selectedDenom.value,
    setMsgGetter,
    state.chain.addressPrefix,
    state.chain.assets,
    state.chain.chainId,
    state.chain.denom,
    toAddress,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgSend</h2>
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
      <div className="form-item form-select">
        <label>Choose a denom:</label>
        <Select
          label="Select denom"
          name="denom-select"
          options={denomOptions}
          value={selectedDenom}
          onChange={(option: (typeof denomOptions)[number]) => {
            setSelectedDenom(option);
            if (option.value !== customDenomOption.value) {
              setCustomDenom("");
            }
          }}
        />
      </div>
      <div className="form-item">
        <Input
          label="Custom denom"
          name="custom-denom"
          value={customDenom}
          onChange={({ target }) => setCustomDenom(target.value)}
          placeholder={
            selectedDenom.value === customDenomOption.value
              ? "Enter custom denom"
              : "Select Custom denom above"
          }
          disabled={selectedDenom.value !== customDenomOption.value}
          error={customDenomError}
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
      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
        }
        .form-item label {
          font-style: italic;
          font-size: 12px;
        }
        .form-select {
          display: flex;
          flex-direction: column;
          gap: 0.8em;
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

export default MsgSendForm;
