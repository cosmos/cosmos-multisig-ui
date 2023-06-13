import { thinSpace } from "../../../lib/displayHelpers";
import { TxMsgTransfer } from "../../../types/txMsg";
import HashView from "../HashView";

interface TxMsgTransferDetailsProps {
  readonly msg: TxMsgTransfer;
}

const TxMsgTransferDetails = ({ msg }: TxMsgTransferDetailsProps) => {
  const timeoutDateObj = new Date(msg.value.timeoutTimestamp.divide(1_000_000).toNumber());
  const timeoutDate = timeoutDateObj.toLocaleDateString();
  const timeoutTime = timeoutDateObj.toLocaleTimeString();

  return (
    <>
      <li>
        <h3>MsgTransfer</h3>
      </li>
      <li>
        <label>Source Port:</label>
        <div>{msg.value.sourcePort}</div>
      </li>
      <li>
        <label>Source Channel:</label>
        <div>{msg.value.sourceChannel}</div>
      </li>
      <li>
        <label>Token:</label>
        <div>{msg.value.token.amount + thinSpace + msg.value.token.denom}</div>
      </li>
      <li>
        <label>To:</label>
        <div title={msg.value.receiver}>
          <HashView hash={msg.value.receiver} />
        </div>
      </li>
      <li>
        <label>Timeout:</label>
        <div>
          {timeoutDate} {timeoutTime}
        </div>
      </li>
      <li>
        <label>Memo:</label>
        <div>{msg.value.memo}</div>
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

export default TxMsgTransferDetails;
