import { fromUtf8 } from "@cosmjs/encoding";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { useAppContext } from "../../../context/AppContext";
import { printableCoins } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgExecuteContractDetailsProps {
  readonly msgValue: MsgExecuteContract;
}

const TxMsgExecuteContractDetails = ({ msgValue }: TxMsgExecuteContractDetailsProps) => {
  const { state } = useAppContext();

  return (
    <>
      <li>
        <h3>MsgExecuteContract</h3>
      </li>
      <li>
        <label>Contract:</label>
        <div title={msgValue.contract}>
          <HashView hash={msgValue.contract} />
        </div>
      </li>
      <li>
        <label>Funds:</label>
        <div>{printableCoins(msgValue.funds, state.chain)}</div>
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
};

export default TxMsgExecuteContractDetails;
