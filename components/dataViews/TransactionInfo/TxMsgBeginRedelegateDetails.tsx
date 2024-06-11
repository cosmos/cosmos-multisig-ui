import { assert } from "@cosmjs/utils";
import { MsgBeginRedelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgBeginRedelegateDetailsProps {
  readonly msgValue: MsgBeginRedelegate;
}

const TxMsgBeginRedelegateDetails = ({ msgValue }: TxMsgBeginRedelegateDetailsProps) => {
  const { chain } = useChains();
  assert(
    msgValue.amount,
    "Amount must be set, same as https://github.com/osmosis-labs/telescope/issues/386",
  );

  return (
    <>
      <li>
        <h3>MsgBeginRedelegate</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msgValue.amount, chain)}</div>
      </li>
      <li>
        <label>Src Validator Address:</label>
        <div title={msgValue.validatorSrcAddress}>
          <HashView hash={msgValue.validatorSrcAddress} />
        </div>
      </li>
      <li>
        <label>Dst Validator Address:</label>
        <div title={msgValue.validatorDstAddress}>
          <HashView hash={msgValue.validatorDstAddress} />
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

export default TxMsgBeginRedelegateDetails;
