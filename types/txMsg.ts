import { Coin, MsgTransferEncodeObject } from "@cosmjs/stargate";
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
  readonly value: {
    readonly fromAddress: string;
    readonly toAddress: string;
    readonly amount: readonly Readonly<Coin>[];
  };
}

export interface TxMsgDelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgDelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
    readonly amount: Readonly<Coin>;
  };
}

export interface TxMsgUndelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
    readonly amount: Readonly<Coin>;
  };
}

export interface TxMsgRedelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorSrcAddress: string;
    readonly validatorDstAddress: string;
    readonly amount: Readonly<Coin>;
  };
}

export interface TxMsgClaimRewards {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
  };
}

export interface TxMsgSetWithdrawAddress {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress";
  readonly value: {
    readonly delegatorAddress: string;
    readonly withdrawAddress: string;
  };
}

export interface TxMsgCreateVestingAccount {
  readonly typeUrl: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount";
  readonly value: {
    readonly fromAddress: string;
    readonly toAddress: string;
    readonly amount: readonly Readonly<Coin>[];
    readonly endTime: Long;
    readonly delayed: boolean;
  };
}

type OmmitedMsgTransfer = Omit<MsgTransfer, "timeoutHeight">;
type MsgTransferRequiredToken = OmmitedMsgTransfer & Required<Pick<OmmitedMsgTransfer, "token">>;

export interface TxMsgTransfer extends MsgTransferEncodeObject {
  readonly value: Readonly<MsgTransferRequiredToken>;
}
