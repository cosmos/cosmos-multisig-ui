import { TxMsgClaimRewards } from "../../../types/txMsg";
import HashView from "../HashView";

interface TxMsgClaimRewardsDetailsProps {
  readonly msg: TxMsgClaimRewards;
}

const TxMsgClaimRewardsDetails = ({ msg }: TxMsgClaimRewardsDetailsProps) => (
  <>
    <li>
      <h2>MsgWithdrawDelegatorReward</h2>
    </li>
    <li>
      <label>Validator Address:</label>
      <div title={msg.value.validatorAddress}>
        <HashView hash={msg.value.validatorAddress} />
      </div>
    </li>
    <style jsx>{`
      li:not(:has(h2)) {
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

export default TxMsgClaimRewardsDetails;
