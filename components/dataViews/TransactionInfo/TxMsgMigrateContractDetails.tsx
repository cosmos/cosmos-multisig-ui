import { fromUtf8 } from "@cosmjs/encoding";
import { MsgMigrateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import HashView from "../HashView";

interface TxMsgMigrateContractDetailsProps {
  readonly msgValue: MsgMigrateContract;
}

const TxMsgMigrateContractDetails = ({ msgValue }: TxMsgMigrateContractDetailsProps) => (
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
    <li>
      <label>Msg:</label>
      <div>{fromUtf8(msgValue.msg)}</div>
    </li>
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
    `}</style>
  </>
);

export default TxMsgMigrateContractDetails;
