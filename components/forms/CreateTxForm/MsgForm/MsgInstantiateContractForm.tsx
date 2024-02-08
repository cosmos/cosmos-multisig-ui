import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { ChainInfo } from "../../../../context/ChainsContext/types";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

const JsonEditor = dynamic(() => import("../../../inputs/JsonEditor"), { ssr: false });

const customDenomOption = { label: "Custom (enter denom below)", value: "custom" } as const;

const getDenomOptions = (assets: ChainInfo["assets"]) => {
  if (!assets?.length) {
    return [customDenomOption];
  }

  return [...assets.map((asset) => ({ label: asset.symbol, value: asset })), customDenomOption];
};

interface MsgInstantiateContractFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgInstantiateContractForm = ({
  fromAddress,
  setMsgGetter,
  deleteMsg,
}: MsgInstantiateContractFormProps) => {
  const { chain } = useChains();

  const denomOptions = getDenomOptions(chain.assets);

  const [codeId, setCodeId] = useState("");
  const [label, setLabel] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [msgContent, setMsgContent] = useState("{}");
  const [selectedDenom, setSelectedDenom] = useState(denomOptions[0]);
  const [customDenom, setCustomDenom] = useState("");
  const [amount, setAmount] = useState("0");

  const jsonError = useRef(false);
  const [codeIdError, setCodeIdError] = useState("");
  const [labelError, setLabelError] = useState("");
  const [adminAddressError, setAdminAddressError] = useState("");
  const [customDenomError, setCustomDenomError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({ codeId, label, adminAddress, customDenom, amount });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { codeId, label, adminAddress, customDenom, amount } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setCodeIdError("");
      setLabelError("");
      setAdminAddressError("");
      setCustomDenomError("");
      setAmountError("");

      if (jsonError.current) {
        return false;
      }

      if (!codeId || !Number.isSafeInteger(Number(codeId)) || Number(codeId) <= 0) {
        setCodeIdError("Code ID must be a positive integer");
        return false;
      }

      if (!label) {
        setLabelError("Label is required");
        return false;
      }

      const addressErrorMsg = checkAddress(adminAddress, chain.addressPrefix);
      if (adminAddress && addressErrorMsg) {
        setAdminAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (
        selectedDenom.value === customDenomOption.value &&
        !customDenom &&
        amount &&
        amount !== "0"
      ) {
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

      try {
        displayCoinToBaseCoin({ denom, amount }, chain.assets);
      } catch (e: unknown) {
        setAmountError(e instanceof Error ? e.message : "Could not set decimals");
        return false;
      }

      return true;
    };

    const denom =
      selectedDenom.value === customDenomOption.value ? customDenom : selectedDenom.value.symbol;

    const microCoin = (() => {
      try {
        if (!denom || !amount || amount === "0") {
          return null;
        }

        return displayCoinToBaseCoin({ denom, amount }, chain.assets);
      } catch {
        return null;
      }
    })();

    const msgContentUtf8Array = (() => {
      try {
        // The JsonEditor does not escape \n or remove whitespaces, so we need to parse + stringify
        return toUtf8(JSON.stringify(JSON.parse(msgContent)));
      } catch {
        return undefined;
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.Instantiate].fromPartial({
      sender: fromAddress,
      codeId: BigInt(codeId),
      label,
      admin: adminAddress,
      msg: msgContentUtf8Array,
      funds: microCoin ? [microCoin] : [],
    });

    const msg: MsgInstantiateContractEncodeObject = {
      typeUrl: MsgTypeUrls.Instantiate,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    fromAddress,
    msgContent,
    selectedDenom.value,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgInstantiateContract</h2>
      <div className="form-item">
        <Input
          label="Code ID"
          name="code-id"
          value={codeId}
          onChange={({ target }) => {
            setCodeId(target.value);
            setCodeIdError("");
          }}
          error={codeIdError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Label"
          name="label"
          value={label}
          onChange={({ target }) => {
            setLabel(target.value);
            setLabelError("");
          }}
          error={labelError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Admin Address"
          name="admin-address"
          value={adminAddress}
          onChange={({ target }) => {
            setAdminAddress(target.value);
            setAdminAddressError("");
          }}
          error={adminAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <JsonEditor
          label="Msg JSON"
          content={{ text: msgContent }}
          onChange={(newMsgContent, _, { contentErrors }) => {
            setMsgContent("text" in newMsgContent ? newMsgContent.text ?? "{}" : "{}");
            jsonError.current = !!contentErrors;
          }}
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
            setCustomDenomError("");
          }}
        />
      </div>
      {selectedDenom.value === customDenomOption.value ? (
        <div className="form-item">
          <Input
            label="Custom denom"
            name="custom-denom"
            value={customDenom}
            onChange={({ target }) => {
              setCustomDenom(target.value);
              setCustomDenomError("");
            }}
            placeholder={
              selectedDenom.value === customDenomOption.value
                ? "Enter custom denom"
                : "Select Custom denom above"
            }
            disabled={selectedDenom.value !== customDenomOption.value}
            error={customDenomError}
          />
        </div>
      ) : null}
      <div className="form-item">
        <Input
          type="number"
          label="Amount"
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

export default MsgInstantiateContractForm;
