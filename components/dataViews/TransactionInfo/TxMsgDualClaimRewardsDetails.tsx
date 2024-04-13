import { MsgDualClaimRewards } from "@/types/lava";
import HashView from "../HashView";

interface TxMsgDualClaimRewardsDetailsProps {
  readonly msgValue: MsgDualClaimRewards;
}

const TxMsgDualClaimRewardsDetails = ({ msgValue }: TxMsgDualClaimRewardsDetailsProps) => (
  <>
    <li>
      <h3>Dualstaking MsgClaimRewards</h3>
    </li>
    <li>
      <label>Provider Address:</label>
      <div title={msgValue.provider}>
        <HashView hash={msgValue.provider} />
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

export default TxMsgDualClaimRewardsDetails;
