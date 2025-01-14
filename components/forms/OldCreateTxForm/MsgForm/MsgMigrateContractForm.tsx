import { MsgMigrateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

const JsonEditor = dynamic(() => import("../../../inputs/JsonEditor"), { ssr: false });

interface MsgMigrateContractFormProps {
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgMigrateContractForm = ({
  senderAddress,
  setMsgGetter,
  deleteMsg,
}: MsgMigrateContractFormProps) => {
  const { chain } = useChains();

  const [contractAddress, setContractAddress] = useState("");
  const [codeId, setCodeId] = useState("");
  const [msgContent, setMsgContent] = useState("{}");

  const jsonError = useRef(false);
  const [contractAddressError, setContractAddressError] = useState("");
  const [codeIdError, setCodeIdError] = useState("");

  const trimmedInputs = trimStringsObj({ contractAddress, codeId });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { contractAddress, codeId } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setContractAddressError("");
      setCodeIdError("");

      if (jsonError.current) {
        return false;
      }

      const addressErrorMsg = checkAddress(contractAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setContractAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (!codeId || !Number.isSafeInteger(Number(codeId)) || Number(codeId) <= 0) {
        setCodeIdError("Code ID must be a positive integer");
        return false;
      }

      return true;
    };

    const msgContentUtf8Array = (() => {
      try {
        // The JsonEditor does not escape \n or remove whitespaces, so we need to parse + stringify
        return toUtf8(JSON.stringify(JSON.parse(msgContent)));
      } catch {
        return undefined;
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.MigrateContract].fromPartial({
      sender: senderAddress,
      contract: contractAddress,
      codeId: BigInt(codeId),
      msg: msgContentUtf8Array,
    });

    const msg: MsgMigrateContractEncodeObject = {
      typeUrl: MsgTypeUrls.MigrateContract,
      value: msgValue,
    };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.addressPrefix, chain.chainId, msgContent, senderAddress, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgMigrateContract</h2>
      <div className="form-item">
        <Input
          label="Contract Address"
          name="contract-address"
          value={contractAddress}
          onChange={({ target }) => {
            setContractAddress(target.value);
            setContractAddressError("");
          }}
          error={contractAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
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
        <JsonEditor
          label="Msg JSON"
          content={{ text: msgContent }}
          onChange={(newMsgContent, _, { contentErrors }) => {
            setMsgContent("text" in newMsgContent ? (newMsgContent.text ?? "{}") : "{}");
            jsonError.current = !!contentErrors;
          }}
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

export default MsgMigrateContractForm;
