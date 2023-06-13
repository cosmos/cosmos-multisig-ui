import { assert } from "@cosmjs/utils";
import { useAppContext } from "../../../context/AppContext";
import { printableCoin } from "../../../lib/displayHelpers";
import { TxMsgRedelegate } from "../../../types/txMsg";
import HashView from "../HashView";

interface TxMsgRedelegateDetailsProps {
  readonly msg: TxMsgRedelegate;
}

const TxMsgRedelegateDetails = ({ msg }: TxMsgRedelegateDetailsProps) => {
  const { state } = useAppContext();
  assert(msg.value.amount, "Amount must be set, same as https://github.com/osmosis-labs/telescope/issues/386");

  return (
    <>
      <li>
        <h3>MsgBeginRedelegate</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msg.value.amount, state.chain)}</div>
      </li>
      <li>
        <label>Src Validator Address:</label>
        <div title={msg.value.validatorSrcAddress}>
          <HashView hash={msg.value.validatorSrcAddress} />
        </div>
      </li>
      <li>
        <label>Dst Validator Address:</label>
        <div title={msg.value.validatorDstAddress}>
          <HashView hash={msg.value.validatorDstAddress} />
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

export default TxMsgRedelegateDetails;
