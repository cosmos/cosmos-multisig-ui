import { MsgGetter } from "..";
import { MsgType } from "../../../../types/txMsg";
import EncodeObjectForm from "./EncodeObjectForm";
import MsgClaimRewardsForm from "./MsgClaimRewardsForm";
import MsgDelegateForm from "./MsgDelegateForm";
import MsgRedelegateForm from "./MsgRedelegateForm";
import MsgSendForm from "./MsgSendForm";
import MsgSetWithdrawAddressForm from "./MsgSetWithdrawAddressForm";
import MsgUndelegateForm from "./MsgUndelegateForm";

interface MsgFormProps {
  readonly msgType: MsgType;
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgForm = ({ msgType, senderAddress, ...restProps }: MsgFormProps) => {
  switch (msgType) {
    case "send":
      return <MsgSendForm fromAddress={senderAddress} {...restProps} />;
    case "delegate":
      return <MsgDelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case "undelegate":
      return <MsgUndelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case "redelegate":
      return <MsgRedelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case "claimRewards":
      return <MsgClaimRewardsForm delegatorAddress={senderAddress} {...restProps} />;
    case "setWithdrawAddress":
      return <MsgSetWithdrawAddressForm delegatorAddress={senderAddress} {...restProps} />;
    case "encodeObject":
      return <EncodeObjectForm {...restProps} />;
    default:
      return null;
  }
};

export default MsgForm;
