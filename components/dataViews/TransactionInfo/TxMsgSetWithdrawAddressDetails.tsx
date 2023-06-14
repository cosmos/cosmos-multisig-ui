import { MsgSetWithdrawAddress } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgSetWithdrawAddressDetailsProps {
  readonly msgValue: MsgSetWithdrawAddress;
}

const TxMsgSetWithdrawAddressDetails = ({ msgValue }: TxMsgSetWithdrawAddressDetailsProps) => (
  <>
    <li>
      <h3>MsgSetWithdrawAddress</h3>
    </li>
    <li>
      <label>Withdraw Address:</label>
      <div title={msgValue.withdrawAddress}>
        <HashView hash={msgValue.withdrawAddress} />
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

export default TxMsgSetWithdrawAddressDetails;
