import { MsgUpdateAdmin } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import HashView from "../HashView";

interface TxMsgUpdateAdminDetailsProps {
  readonly msgValue: MsgUpdateAdmin;
}

const TxMsgUpdateAdminDetails = ({ msgValue }: TxMsgUpdateAdminDetailsProps) => {
  return (
    <>
      <li>
        <h3>MsgUpdateAdmin</h3>
      </li>
      <li>
        <label>Contract:</label>
        <div title={msgValue.contract}>
          <HashView hash={msgValue.contract} />
        </div>
      </li>
      <li>
        <label>New admin:</label>
        <div>{msgValue.newAdmin.toString()}</div>
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

export default TxMsgUpdateAdminDetails;
