import { useAppContext } from "../../../context/AppContext";
import { printableCoins } from "../../../lib/displayHelpers";
import {
  isTxMsgClaimRewards,
  isTxMsgDelegate,
  isTxMsgRedelegate,
  isTxMsgSend,
  isTxMsgUndelegate,
} from "../../../lib/txMsgHelpers";
import { DbTransaction } from "../../../types";
import StackableContainer from "../../layout/StackableContainer";
import TxMsgClaimRewardsDetails from "./TxMsgClaimRewardsDetails";
import TxMsgDelegateDetails from "./TxMsgDelegateDetails";
import TxMsgRedelegateDetails from "./TxMsgRedelegateDetails";
import TxMsgSendDetails from "./TxMsgSendDetails";
import TxMsgUndelegateDetails from "./TxMsgUndelegateDetails";

interface Props {
  readonly tx: DbTransaction;
}

const TransactionInfo = ({ tx }: Props) => {
  const { state } = useAppContext();

  return (
    <StackableContainer lessPadding lessMargin>
      <ul className="meta-data">
        <>
          {tx.msgs.map((msg, index) => (
            <>
              {isTxMsgSend(msg) ? <TxMsgSendDetails key={index} msg={msg} /> : null}
              {isTxMsgDelegate(msg) ? <TxMsgDelegateDetails key={index} msg={msg} /> : null}
              {isTxMsgUndelegate(msg) ? <TxMsgUndelegateDetails key={index} msg={msg} /> : null}
              {isTxMsgRedelegate(msg) ? <TxMsgRedelegateDetails key={index} msg={msg} /> : null}
              {isTxMsgClaimRewards(msg) ? <TxMsgClaimRewardsDetails key={index} msg={msg} /> : null}
            </>
          ))}
          {tx.fee ? (
            <>
              <li>
                <label>Gas:</label>
                <div>{tx.fee.gas}</div>
              </li>
              <li>
                <label>Fee:</label>
                <div>{printableCoins(tx.fee.amount, state.chain)}</div>
              </li>
            </>
          ) : null}
          {tx.memo ? (
            <li>
              <label>Memo:</label>
              <div>{tx.memo}</div>
            </li>
          ) : null}
        </>
      </ul>
      <style jsx>{`
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .meta-data li {
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        .meta-data li div {
          padding: 3px 6px;
        }
        .meta-data label {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 6px;
          border-radius: 5px;
          display: block;
        }
      `}</style>
    </StackableContainer>
  );
};

export default TransactionInfo;
