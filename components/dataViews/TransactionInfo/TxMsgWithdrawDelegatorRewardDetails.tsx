import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgWithdrawDelegatorRewardDetailsProps {
  readonly msgValue: MsgWithdrawDelegatorReward;
}

const TxMsgWithdrawDelegatorRewardDetails = ({
  msgValue,
}: TxMsgWithdrawDelegatorRewardDetailsProps) => (
  <>
    <li>
      <h3>MsgWithdrawDelegatorReward</h3>
    </li>
    <li>
      <label>Validator Address:</label>
      <div title={msgValue.validatorAddress}>
        <HashView hash={msgValue.validatorAddress} />
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

export default TxMsgWithdrawDelegatorRewardDetails;
