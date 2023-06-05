import { EncodeObject } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useAppContext } from "../../../../context/AppContext";
import { isEncodeObject } from "../../../../lib/txMsgHelpers";
import { TxMsg } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface EncodeObjectFormProps {
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const EncodeObjectForm = ({ setMsgGetter, deleteMsg }: EncodeObjectFormProps) => {
  const { state } = useAppContext();
  assert(state.chain.addressPrefix, "addressPrefix missing");

  const [msgTypeUrl, setMsgTypeUrl] = useState("");
  const [msgValue, setMsgValue] = useState("");

  const [msgTypeUrlError, setMsgTypeUrlError] = useState("");
  const [msgValueError, setMsgValueError] = useState("");

  useEffect(() => {
    setMsgTypeUrlError("");
    setMsgValueError("");

    const isMsgValid = (msg: TxMsg): msg is EncodeObject => {
      if (!msgTypeUrl) {
        setMsgTypeUrlError("Type URL is required");
        return false;
      }

      if (!msgValue) {
        setMsgValueError("Value is required");
        return false;
      }

      try {
        JSON.parse(msgValue);
      } catch {
        setMsgValueError("Value must be valid JSON");
        return false;
      }

      return isEncodeObject(msg);
    };

    const parsedMsgValue = (() => {
      try {
        return JSON.parse(msgValue);
      } catch {
        return {};
      }
    })();

    const msg: EncodeObject = { typeUrl: msgTypeUrl, value: parsedMsgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [msgTypeUrl, msgValue, setMsgGetter]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>Custom EncodeObject</h2>
      <div className="form-item">
        <Input
          label="Type URL"
          name="msg-type-url"
          value={msgTypeUrl}
          onChange={({ target }) => setMsgTypeUrl(target.value)}
          error={msgTypeUrlError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Value"
          name="msg-value"
          value={msgValue}
          onChange={({ target }) => setMsgValue(target.value)}
          error={msgValueError}
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

export default EncodeObjectForm;
