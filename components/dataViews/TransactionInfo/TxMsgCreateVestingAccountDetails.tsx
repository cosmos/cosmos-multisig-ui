import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import { useChains } from "../../../context/ChainsContext";
import { printableCoins } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgCreateVestingAccountDetailsProps {
  readonly msgValue: MsgCreateVestingAccount;
}

const TxMsgCreateVestingAccountDetails = ({ msgValue }: TxMsgCreateVestingAccountDetailsProps) => {
  const { chain } = useChains();
  const endTimeDateObj = new Date(Number(msgValue.endTime * 1000n));
  const endTimeDate = endTimeDateObj.toLocaleDateString();
  const endTimeHours = endTimeDateObj.toLocaleTimeString().slice(0, -3);

  return (
    <>
      <li>
        <h3>MsgCreateVestingAccount</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoins(msgValue.amount, chain) || "None"}</div>
      </li>
      <li>
        <label>From:</label>
        <div title={msgValue.fromAddress}>
          <HashView hash={msgValue.fromAddress} />
        </div>
      </li>
      <li>
        <label>To:</label>
        <div title={msgValue.toAddress}>
          <HashView hash={msgValue.toAddress} />
        </div>
      </li>
      <li>
        <label>End time:</label>
        <div title={String(msgValue.endTime)}>
          <p>
            {endTimeDate} {endTimeHours}
          </p>
        </div>
      </li>
      <li>
        <label>Delayed:</label>
        <div title={String(msgValue.endTime)}>
          <p>{msgValue.delayed ? "Yes" : "No"}</p>
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
