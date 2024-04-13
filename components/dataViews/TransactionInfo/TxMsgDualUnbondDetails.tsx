import { MsgDualUnbond } from "@/types/lava";
import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgDualUnbondDetailsProps {
  readonly msgValue: MsgDualUnbond;
}

const TxMsgDualUnbondDetails = ({ msgValue }: TxMsgDualUnbondDetailsProps) => {
  const { chain } = useChains();

  return (
    <>
      <li>
        <h3>Dualstaking MsgUnbond</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msgValue.amount, chain)}</div>
      </li>
      <li>
        <label>Validator Address:</label>
        <div title={msgValue.validator}>
          <HashView hash={msgValue.validator} />
        </div>
      </li>
      <li>
        <label>Provider Address:</label>
        <div title={msgValue.provider}>
          <HashView hash={msgValue.provider} />
        </div>
      </li>
      <li>
        <label>Chain ID:</label>
        <div title={msgValue.chainID}>
          <p>{msgValue.chainID}</p>
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

export default TxMsgDualUnbondDetails;
