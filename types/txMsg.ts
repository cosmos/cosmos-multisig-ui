import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { MsgSetWithdrawAddress, MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export type MsgType =
  | "send"
  | "delegate"
  | "undelegate"
  | "redelegate"
  | "claimRewards"
  | "setWithdrawAddress"
  | "createVestingAccount"
  | "msgTransfer";

export type TxMsg =
  | TxMsgSend
  | TxMsgDelegate
  | TxMsgUndelegate
  | TxMsgRedelegate
  | TxMsgClaimRewards
  | TxMsgSetWithdrawAddress
  | TxMsgCreateVestingAccount
  | TxMsgTransfer;

export interface TxMsgSend {
  readonly typeUrl: "/cosmos.bank.v1beta1.MsgSend";
  readonly value: MsgSend;
}

export interface TxMsgDelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgDelegate";
  readonly value: MsgDelegate;
}

export interface TxMsgUndelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate";
  readonly value: MsgUndelegate;
}

export interface TxMsgRedelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
  readonly value: MsgBeginRedelegate;
}

export interface TxMsgClaimRewards {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
  readonly value: MsgWithdrawDelegatorReward;
}

export interface TxMsgSetWithdrawAddress {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress";
  readonly value: MsgSetWithdrawAddress;
}

export interface TxMsgCreateVestingAccount {
  readonly typeUrl: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount";
  readonly value: MsgCreateVestingAccount;
}

export interface TxMsgTransfer {
  readonly typeUrl: "/ibc.applications.transfer.v1.MsgTransfer";
  readonly value: MsgTransfer;
}
