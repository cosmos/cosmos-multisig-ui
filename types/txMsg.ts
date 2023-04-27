export type TxType = null | "send" | "delegate" | "undelegate" | "redelegate" | "claimRewards";

export type TxMsg =
  | TxMsgSend
  | TxMsgDelegate
  | TxMsgUndelegate
  | TxMsgRedelegate
  | TxMsgClaimRewards;

export interface TxMsgSend {
  readonly typeUrl: "/cosmos.bank.v1beta1.MsgSend";
  readonly value: {
    readonly fromAddress: string;
    readonly toAddress: string;
    readonly amount: [{ readonly amount: string; readonly denom: string }];
  };
}

export interface TxMsgDelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgDelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
    readonly amount: [{ readonly amount: string; readonly denom: string }];
  };
}

export interface TxMsgUndelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
    readonly amount: [{ readonly amount: string; readonly denom: string }];
  };
}

export interface TxMsgRedelegate {
  readonly typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorSrcAddress: string;
    readonly validatorDstAddress: string;
    readonly amount: [{ readonly amount: string; readonly denom: string }];
  };
}

export interface TxMsgClaimRewards {
  readonly typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
  readonly value: {
    readonly delegatorAddress: string;
    readonly validatorAddress: string;
  };
}
