import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { useChains } from "../../../context/ChainsContext";
import { printableCoins } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgSendDetailsProps {
  readonly msgValue: MsgSend;
}

const TxMsgSendDetails = ({ msgValue }: TxMsgSendDetailsProps) => {
  const { chain } = useChains();

  return (
    <>
      <li>
        <h3>MsgSend</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoins(msgValue.amount, chain) || "None"}</div>
      </li>
      <li>
        <label>To:</label>
        <div title={msgValue.toAddress}>
          <HashView hash={msgValue.toAddress} />
        </div>
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

export default TxMsgSendDetails;
