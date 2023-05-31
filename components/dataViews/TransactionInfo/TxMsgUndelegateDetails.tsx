import { useAppContext } from "../../../context/AppContext";
import { printableCoin } from "../../../lib/displayHelpers";
import { TxMsgUndelegate } from "../../../types/txMsg";
import HashView from "../HashView";

interface TxMsgUndelegateDetailsProps {
  readonly msg: TxMsgUndelegate;
}

const TxMsgUndelegateDetails = ({ msg }: TxMsgUndelegateDetailsProps) => {
  const { state } = useAppContext();

  return (
    <>
      <li>
        <h3>MsgUndelegate</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msg.value.amount, state.chain)}</div>
      </li>
      <li>
        <label>Validator Address:</label>
        <div title={msg.value.validatorAddress}>
          <HashView hash={msg.value.validatorAddress} />
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

export default TxMsgUndelegateDetails;
