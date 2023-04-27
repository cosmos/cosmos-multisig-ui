import { Dispatch, SetStateAction } from "react";
import { TxMsg, TxType } from "../../../../types/txMsg";
import MsgClaimRewardsForm from "./MsgClaimRewardsForm";
import MsgDelegateForm from "./MsgDelegateForm";
import MsgRedelegateForm from "./MsgRedelegateForm";
import MsgSendForm from "./MsgSendForm";
import MsgUndelegateForm from "./MsgUndelegateForm";

type MsgFormProps = {
  readonly txType: TxType;
} & {
  readonly senderAddress: string;
  readonly setCheckAndGetMsg: Dispatch<SetStateAction<(() => TxMsg | null) | undefined>>;
};

const MsgForm = ({ txType, senderAddress, ...restProps }: MsgFormProps) => {
  switch (txType) {
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
    default:
      return null;
  }
};

export default MsgForm;
