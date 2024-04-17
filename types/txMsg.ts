import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
} from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgInstantiateContract2,
  MsgMigrateContract,
  MsgUpdateAdmin
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export const MsgTypeUrls = {
  Send: "/cosmos.bank.v1beta1.MsgSend",
  SetWithdrawAddress: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  WithdrawDelegatorReward: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  BeginRedelegate: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  Delegate: "/cosmos.staking.v1beta1.MsgDelegate",
  Undelegate: "/cosmos.staking.v1beta1.MsgUndelegate",
  CreateVestingAccount: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
  Transfer: "/ibc.applications.transfer.v1.MsgTransfer",
  Execute: "/cosmwasm.wasm.v1.MsgExecuteContract",
  Instantiate: "/cosmwasm.wasm.v1.MsgInstantiateContract",
  Instantiate2: "/cosmwasm.wasm.v1.MsgInstantiateContract2",
  Migrate: "/cosmwasm.wasm.v1.MsgMigrateContract",
  UpdateAdmin: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
} as const;

export type MsgTypeUrl = (typeof MsgTypeUrls)[keyof typeof MsgTypeUrls];

export const MsgCodecs = {
  [MsgTypeUrls.Send]: MsgSend,
  [MsgTypeUrls.SetWithdrawAddress]: MsgSetWithdrawAddress,
  [MsgTypeUrls.WithdrawDelegatorReward]: MsgWithdrawDelegatorReward,
  [MsgTypeUrls.BeginRedelegate]: MsgBeginRedelegate,
  [MsgTypeUrls.Delegate]: MsgDelegate,
  [MsgTypeUrls.Undelegate]: MsgUndelegate,
  [MsgTypeUrls.CreateVestingAccount]: MsgCreateVestingAccount,
  [MsgTypeUrls.Transfer]: MsgTransfer,
  [MsgTypeUrls.Execute]: MsgExecuteContract,
  [MsgTypeUrls.Instantiate]: MsgInstantiateContract,
  [MsgTypeUrls.Instantiate2]: MsgInstantiateContract2,
  [MsgTypeUrls.Migrate]: MsgMigrateContract,
  [MsgTypeUrls.UpdateAdmin]: MsgUpdateAdmin,
};
