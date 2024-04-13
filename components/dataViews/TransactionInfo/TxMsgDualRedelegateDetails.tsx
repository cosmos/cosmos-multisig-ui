import { MsgDualRedelegate } from "@/types/lava";
import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgDualRedelegateDetailsProps {
  readonly msgValue: MsgDualRedelegate;
}

const TxMsgDualRedelegateDetails = ({ msgValue }: TxMsgDualRedelegateDetailsProps) => {
  const { chain } = useChains();

  return (
    <>
      <li>
        <h3>Dualstaking MsgRedelegate</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msgValue.amount, chain)}</div>
      </li>
      <li>
        <label>From Provider Address:</label>
        <div title={msgValue.fromProvider}>
          <HashView hash={msgValue.fromProvider} />
        </div>
      </li>
      <li>
        <label>To Provider Address:</label>
        <div title={msgValue.toProvider}>
          <HashView hash={msgValue.toProvider} />
        </div>
      </li>
      <li>
        <label>From Chain ID:</label>
        <div title={msgValue.fromChainID}>
          <p>{msgValue.fromChainID}</p>
        </div>
      </li>
      <li>
        <label>To Chain ID:</label>
        <div title={msgValue.toChainID}>
          <p>{msgValue.toChainID}</p>
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

export default TxMsgDualRedelegateDetails;
