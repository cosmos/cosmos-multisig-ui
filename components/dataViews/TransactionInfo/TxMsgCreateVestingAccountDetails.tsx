import { useAppContext } from "../../../context/AppContext";
import { printableCoins } from "../../../lib/displayHelpers";
import { TxMsgCreateVestingAccount } from "../../../types/txMsg";
import HashView from "../HashView";

interface TxMsgCreateVestingAccountDetailsProps {
  readonly msg: TxMsgCreateVestingAccount;
}

const TxMsgCreateVestingAccountDetails = ({ msg }: TxMsgCreateVestingAccountDetailsProps) => {
  const { state } = useAppContext();
  const endTimeDateObj = new Date(msg.value.endTime.multiply(1000).toNumber());
  const endTimeDate = endTimeDateObj.toLocaleDateString();
  const endTimeHours = endTimeDateObj.toLocaleTimeString().slice(0, -3);

  return (
    <>
      <li>
        <h3>MsgCreateVestingAccount</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoins(msg.value.amount, state.chain)}</div>
      </li>
      <li>
        <label>From:</label>
        <div title={msg.value.fromAddress}>
          <HashView hash={msg.value.fromAddress} />
        </div>
      </li>
      <li>
        <label>To:</label>
        <div title={msg.value.toAddress}>
          <HashView hash={msg.value.toAddress} />
        </div>
      </li>
      <li>
        <label>End time:</label>
        <div title={String(msg.value.endTime)}>
          <p>
            {endTimeDate} {endTimeHours}
          </p>
        </div>
      </li>
      <li>
        <label>Delayed:</label>
        <div title={String(msg.value.endTime)}>
          <p>{msg.value.delayed ? "Yes" : "No"}</p>
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

export default TxMsgCreateVestingAccountDetails;
