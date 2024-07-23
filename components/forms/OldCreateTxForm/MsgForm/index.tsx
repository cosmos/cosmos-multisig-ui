import { MsgGetter } from "..";
import { MsgTypeUrl, MsgTypeUrls } from "../../../../types/txMsg";
import MsgBeginRedelegateForm from "./MsgBeginRedelegateForm";
import MsgCreateVestingAccountForm from "./MsgCreateVestingAccountForm";
import MsgDelegateForm from "./MsgDelegateForm";
import MsgExecuteContractForm from "./MsgExecuteContractForm";
import MsgFundCommunityPoolForm from "./MsgFundCommunityPoolForm";
import MsgInstantiateContract2Form from "./MsgInstantiateContract2Form";
import MsgInstantiateContractForm from "./MsgInstantiateContractForm";
import MsgMigrateContractForm from "./MsgMigrateContractForm";
import MsgSendForm from "./MsgSendForm";
import MsgSetWithdrawAddressForm from "./MsgSetWithdrawAddressForm";
import MsgTransferForm from "./MsgTransferForm";
import MsgUndelegateForm from "./MsgUndelegateForm";
import MsgUpdateAdminForm from "./MsgUpdateAdminForm";
import MsgVoteForm from "./MsgVoteForm";
import MsgWithdrawDelegatorRewardForm from "./MsgWithdrawDelegatorRewardForm";

interface MsgFormProps {
  readonly msgType: MsgTypeUrl;
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgForm = ({ msgType, ...restProps }: MsgFormProps) => {
  switch (msgType) {
    // Bank
    case MsgTypeUrls.Send:
      return <MsgSendForm {...restProps} />;
    // Staking
    case MsgTypeUrls.Delegate:
      return <MsgDelegateForm {...restProps} />;
    case MsgTypeUrls.Undelegate:
      return <MsgUndelegateForm {...restProps} />;
    case MsgTypeUrls.BeginRedelegate:
      return <MsgBeginRedelegateForm {...restProps} />;
    // Distribution
    case MsgTypeUrls.FundCommunityPool:
      return <MsgFundCommunityPoolForm {...restProps} />;
    case MsgTypeUrls.SetWithdrawAddress:
      return <MsgSetWithdrawAddressForm {...restProps} />;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return <MsgWithdrawDelegatorRewardForm {...restProps} />;
    // Vesting
    case MsgTypeUrls.CreateVestingAccount:
      return <MsgCreateVestingAccountForm {...restProps} />;
    // Governance
    case MsgTypeUrls.Vote:
      return <MsgVoteForm {...restProps} />;
    // IBC
    case MsgTypeUrls.Transfer:
      return <MsgTransferForm {...restProps} />;
    // CosmWasm
    case MsgTypeUrls.InstantiateContract:
      return <MsgInstantiateContractForm {...restProps} />;
    case MsgTypeUrls.InstantiateContract2:
      return <MsgInstantiateContract2Form {...restProps} />;
    case MsgTypeUrls.UpdateAdmin:
      return <MsgUpdateAdminForm {...restProps} />;
    case MsgTypeUrls.ExecuteContract:
      return <MsgExecuteContractForm {...restProps} />;
    case MsgTypeUrls.MigrateContract:
      return <MsgMigrateContractForm {...restProps} />;
    default:
      return null;
  }
};

export default MsgForm;
