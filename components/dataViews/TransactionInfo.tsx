import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useAppContext } from "../../context/AppContext";
import { printableCoin, printableCoins } from "../../lib/displayHelpers";
import { DbTransaction } from "../../types";
import StackableContainer from "../layout/StackableContainer";
import HashView from "./HashView";

interface Props {
  tx: DbTransaction;
}

const TransactionInfo = (props: Props) => {
  const { state } = useAppContext();
  return (
    <StackableContainer lessPadding lessMargin>
      <ul className="meta-data">
        <>
          {(props.tx.msgs || []).map((msg) =>
            msg.typeUrl === "/cosmos.bank.v1beta1.MsgSend" ? (
              <>
                <li>
                  <label>Amount:</label>
                  <div>{printableCoins(msg.value.amount[0], state.chain)}</div>
                </li>
                <li>
                  <label>To:</label>
                  <div title={msg.value.toAddress}>
                    <HashView hash={msg.value.toAddress} />
                  </div>
                </li>
              </>
            ) : msg.typeUrl === "/cosmos.staking.v1beta1.MsgDelegate" ||
              msg.typeUrl === "/cosmos.staking.v1beta1.MsgUndelegate" ? (
              <>
                <li>
                  <label>Amount:</label>
                  <div>{printableCoin(msg.value.amount[0], state.chain)}</div>
                </li>
                <li>
                  <label>Validator Address:</label>
                  <div title={msg.value.validatorAddress}>
                    <HashView hash={msg.value.validatorAddress} />
                  </div>
                </li>
              </>
            ) : msg.typeUrl === "/cosmos.staking.v1beta1.MsgBeginRedelegate" ? (
              <>
                <li>
                  <label>Amount:</label>
                  <div>{printableCoin(msg.value.amount[0], state.chain)}</div>
                </li>
                <li>
                  <label>Source Validator Address:</label>
                  <div title={msg.value.validatorSrcAddress}>
                    <HashView hash={msg.value.validatorSrcAddress} />
                  </div>
                </li>
                <li>
                  <label>Destination Validator Address:</label>
                  <div title={msg.value.validatorDstAddress}>
                    <HashView hash={msg.value.validatorDstAddress} />
                  </div>
                </li>
              </>
            ) : msg.typeUrl === "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward" ? (
              <li>
                <label>Validator Address:</label>
                <div title={msg.value.validatorAddress}>
                  <HashView hash={msg.value.validatorAddress} />
                </div>
              </li>
            ) : null,
          )}
          {props.tx.fee && (
            <>
              <li>
                <label>Gas:</label>
                <div>{props.tx.fee.gas}</div>
              </li>
              <li>
                <label>Fee:</label>
                <div>{printableCoins(props.tx.fee.amount as Coin[], state.chain)}</div>
              </li>
            </>
          )}
          {props.tx.memo && (
            <li>
              <label>Memo:</label>
              <div>{props.tx.memo}</div>
            </li>
          )}
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
        .meta-data li:first-child {
          margin-top: 0;
        }
        .meta-data label {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 6px;
          border-radius: 5px;
          display: block;
        }
        .meta-data li div {
          padding: 3px 6px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default TransactionInfo;
