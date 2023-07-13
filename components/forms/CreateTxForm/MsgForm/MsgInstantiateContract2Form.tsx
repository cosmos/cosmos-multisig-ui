import { MsgInstantiateContract2EncodeObject } from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";
import { Decimal } from "@cosmjs/math";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { ChainInfo } from "../../../../context/ChainsContext/types";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
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

interface MsgInstantiateContract2FormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgInstantiateContract2Form = ({
  fromAddress,
  setMsgGetter,
  deleteMsg,
}: MsgInstantiateContract2FormProps) => {
  const { chain } = useChains();

  const denomOptions = getDenomOptions(chain.assets);

  const [codeId, setCodeId] = useState("");
  const [label, setLabel] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [fixMsg, setFixMsg] = useState(false);
  const [salt, setSalt] = useState("");
  const [msgContent, setMsgContent] = useState("{}");
  const [selectedDenom, setSelectedDenom] = useState(denomOptions[0]);
  const [customDenom, setCustomDenom] = useState("");
  const [amount, setAmount] = useState("0");

  const [codeIdError, setCodeIdError] = useState("");
  const [adminAddressError, setAdminAddressError] = useState("");
  const [msgContentError, setMsgContentError] = useState("");
  const [customDenomError, setCustomDenomError] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    setCodeIdError("");
    setAdminAddressError("");
    setMsgContentError("");
    setCustomDenomError("");
    setAmountError("");

    const isMsgValid = (): boolean => {
      if (!codeId || !Number.isSafeInteger(Number(codeId)) || Number(codeId) <= 0) {
        setCodeIdError("Code ID must be a positive integer");
        return false;
      }

      const addressErrorMsg = checkAddress(adminAddress, chain.addressPrefix);
      if (adminAddress && addressErrorMsg) {
        setAdminAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      try {
        JSON.parse(msgContent);
      } catch {
        setMsgContentError("Msg must be valid JSON");
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

        const foundAsset = chain.assets?.find((asset) => asset.symbol === denom);
        const exponent =
          foundAsset?.denom_units.find((unit) => unit.denom === foundAsset.symbol.toLowerCase())
            ?.exponent ?? 0;

        return Decimal.fromUserInput(amount, exponent).atomics;
      } catch {
        return "0";
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.Instantiate2].fromPartial({
      sender: fromAddress,
      codeId,
      label,
      admin: adminAddress,
      fixMsg,
      salt: toUtf8(salt),
      msg: toUtf8(msgContent),
      funds: [{ denom, amount: amountInAtomics }],
    });

    const msg: MsgInstantiateContract2EncodeObject = {
      typeUrl: MsgTypeUrls.Instantiate2,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [
    adminAddress,
    amount,
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.denom,
    codeId,
    customDenom,
    fixMsg,
    fromAddress,
    label,
    msgContent,
    salt,
    selectedDenom.value,
    setMsgGetter,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgInstantiateContract2</h2>
      <div className="form-item">
        <Input
          label="Code ID"
          name="code-id"
          value={codeId}
          onChange={({ target }) => setCodeId(target.value)}
          error={codeIdError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Label"
          name="label"
          value={label}
          onChange={({ target }) => setLabel(target.value)}
        />
      </div>
      <div className="form-item">
        <Input
          label="Admin Address"
          name="admin-address"
          value={adminAddress}
          onChange={({ target }) => setAdminAddress(target.value)}
          error={adminAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          type="checkbox"
          label="Fix msg"
          name="fix-msg"
          checked={fixMsg}
          value={String(fixMsg)}
          onChange={({ target }) => setFixMsg(target.checked)}
        />
      </div>
      <div className="form-item">
        <Input
          label="Salt"
          name="salt"
          value={salt}
          onChange={({ target }) => setSalt(target.value)}
        />
      </div>
      <div className="form-item">
        <Input
          label="Msg"
          name="msg-content"
          value={msgContent}
          onChange={({ target }) => setMsgContent(target.value)}
          error={msgContentError}
          placeholder={"Enter msg JSON"}
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

export default MsgInstantiateContract2Form;