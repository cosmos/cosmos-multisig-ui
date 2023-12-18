import { fromUtf8 } from "@cosmjs/encoding";
import { MsgMigrateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { JSONValue } from "immutable-json-patch";
import dynamic from "next/dynamic";
import { useState } from "react";
import HashView from "../HashView";

const JsonEditor = dynamic(() => import("../../inputs/JsonEditor"), { ssr: false });

interface TxMsgMigrateContractDetailsProps {
  readonly msgValue: MsgMigrateContract;
}

const TxMsgMigrateContractDetails = ({ msgValue }: TxMsgMigrateContractDetailsProps) => {
  const [parseError, setParseError] = useState("");

  const json: JSONValue = (() => {
    if (parseError) {
      return {};
    }

    try {
      return JSON.parse(fromUtf8(msgValue.msg));
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Failed to decode UTF-8 msg");
      return {};
    }
  })();

  return (
    <>
      <li>
        <h3>MsgMigrateContract</h3>
      </li>
      <li>
        <label>Contract:</label>
        <div title={msgValue.contract}>
          <HashView hash={msgValue.contract} />
        </div>
      </li>
      <li>
        <label>Code ID:</label>
        <div>{msgValue.codeId.toString()}</div>
      </li>
      {parseError ? (
        <li className="parse-error">
          <p>{parseError}</p>
        </li>
      ) : (
        <li>
          <JsonEditor readOnly content={{ json }} />
        </li>
      )}
      <style jsx>{`
        li:not(:has(h3)) {
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        li + li:nth-child(2) {
          margin-top: 25px;
        }
        li + li {
          margin-top: 10px;
        }
        li div {
          padding: 3px 6px;
        }
        label {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 6px;
          border-radius: 5px;
          display: block;
        }
        .parse-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
      `}</style>
    </>
  );
};

export default TxMsgMigrateContractDetails;
