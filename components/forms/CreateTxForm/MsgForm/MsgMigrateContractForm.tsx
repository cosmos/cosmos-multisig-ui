import { MsgMigrateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

const JsonEditor = dynamic(() => import("../../../inputs/JsonEditor"), { ssr: false });

interface MsgMigrateContractFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgMigrateContractForm = ({
  fromAddress,
  setMsgGetter,
  deleteMsg,
}: MsgMigrateContractFormProps) => {
  const { chain } = useChains();

  const [codeId, setCodeId] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [msgContent, setMsgContent] = useState("{}");

  const [codeIdError, setCodeIdError] = useState("");
  const [contractAddressError, setContractAddressError] = useState("");

  useEffect(() => {
    setCodeIdError("");
    setContractAddressError("");

    const isMsgValid = (): boolean => {
      if (!codeId || !Number.isSafeInteger(Number(codeId)) || Number(codeId) <= 0) {
        setCodeIdError("Code ID must be a positive integer");
        return false;
      }

      const addressErrorMsg = checkAddress(contractAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setContractAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.Migrate].fromPartial({
      sender: fromAddress,
      contract: contractAddress,
      codeId: codeId || 1,
      msg: toUtf8(msgContent),
    });

    const msg: MsgMigrateContractEncodeObject = { typeUrl: MsgTypeUrls.Migrate, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.chainId,
    codeId,
    contractAddress,
    fromAddress,
    msgContent,
    setMsgGetter,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgMigrateContract</h2>
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
          label="Contract Address"
          name="contract-address"
          value={contractAddress}
          onChange={({ target }) => setContractAddress(target.value)}
          error={contractAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <JsonEditor
          label="Msg JSON"
          content={{ text: msgContent }}
          onChange={(newMsgContent) =>
            setMsgContent("text" in newMsgContent ? newMsgContent.text ?? "{}" : "{}")
          }
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
