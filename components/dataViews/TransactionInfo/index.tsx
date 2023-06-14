import { useAppContext } from "../../../context/AppContext";
import { printableCoins } from "../../../lib/displayHelpers";
import { DbTransaction } from "../../../types";
import { MsgTypeUrls } from "../../../types/txMsg";
import StackableContainer from "../../layout/StackableContainer";
import TxMsgClaimRewardsDetails from "./TxMsgClaimRewardsDetails";
import TxMsgCreateVestingAccountDetails from "./TxMsgCreateVestingAccountDetails";
import TxMsgDelegateDetails from "./TxMsgDelegateDetails";
import TxMsgRedelegateDetails from "./TxMsgRedelegateDetails";
import TxMsgSendDetails from "./TxMsgSendDetails";
import TxMsgSetWithdrawAddressDetails from "./TxMsgSetWithdrawAddressDetails";
import TxMsgTransferDetails from "./TxMsgTransferDetails";
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
                {MsgTypeUrls.Send === msg.typeUrl ? (
                  <TxMsgSendDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.Delegate === msg.typeUrl ? (
                  <TxMsgDelegateDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.Undelegate === msg.typeUrl ? (
                  <TxMsgUndelegateDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.BeginRedelegate === msg.typeUrl ? (
                  <TxMsgRedelegateDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.WithdrawDelegatorReward === msg.typeUrl ? (
                  <TxMsgClaimRewardsDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.SetWithdrawAddress === msg.typeUrl ? (
                  <TxMsgSetWithdrawAddressDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.CreateVestingAccount === msg.typeUrl ? (
                  <TxMsgCreateVestingAccountDetails msgValue={msg.value} />
                ) : null}
                {MsgTypeUrls.Transfer === msg.typeUrl ? (
                  <TxMsgTransferDetails msgValue={msg.value} />
                ) : null}
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
