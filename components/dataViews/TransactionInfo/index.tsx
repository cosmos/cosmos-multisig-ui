import { useAppContext } from "../../../context/AppContext";
import { printableCoins } from "../../../lib/displayHelpers";
import {
  isTxMsgClaimRewards,
  isTxMsgDelegate,
  isTxMsgRedelegate,
  isTxMsgSend,
  isTxMsgSetWithdrawAddress,
  isTxMsgUndelegate,
  isUnknownEncodeObject,
} from "../../../lib/txMsgHelpers";
import { DbTransaction } from "../../../types";
import StackableContainer from "../../layout/StackableContainer";
import TxEncodeObjectDetails from "./TxEncodeObjectDetails";
import TxMsgClaimRewardsDetails from "./TxMsgClaimRewardsDetails";
import TxMsgDelegateDetails from "./TxMsgDelegateDetails";
import TxMsgRedelegateDetails from "./TxMsgRedelegateDetails";
import TxMsgSendDetails from "./TxMsgSendDetails";
import TxMsgSetWithdrawAddressDetails from "./TxMsgSetWithdrawAddressDetails";
import TxMsgUndelegateDetails from "./TxMsgUndelegateDetails";

interface Props {
  readonly tx: DbTransaction;
}

const TransactionInfo = ({ tx }: Props) => {
  const { state } = useAppContext();

  return (
    <>
      <ul className="meta-data">
        <>
          <StackableContainer lessPadding lessMargin>
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
          </StackableContainer>
          <StackableContainer lessPadding lessMargin>
            {tx.msgs.map((msg, index) => (
              <StackableContainer key={index} lessPadding lessMargin>
                {isTxMsgSend(msg) ? <TxMsgSendDetails msg={msg} /> : null}
                {isTxMsgDelegate(msg) ? <TxMsgDelegateDetails msg={msg} /> : null}
                {isTxMsgUndelegate(msg) ? <TxMsgUndelegateDetails msg={msg} /> : null}
                {isTxMsgRedelegate(msg) ? <TxMsgRedelegateDetails msg={msg} /> : null}
                {isTxMsgClaimRewards(msg) ? <TxMsgClaimRewardsDetails msg={msg} /> : null}
                {isTxMsgSetWithdrawAddress(msg) ? (
                  <TxMsgSetWithdrawAddressDetails msg={msg} />
                ) : null}
                {isUnknownEncodeObject(msg) ? <TxEncodeObjectDetails msg={msg} /> : null}
              </StackableContainer>
            ))}
          </StackableContainer>
        </>
      </ul>
      <style jsx>{`
        .meta-data {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-top: 25px;
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
    </>
  );
};

export default TransactionInfo;
