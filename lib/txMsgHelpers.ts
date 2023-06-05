import { EncodeObject } from "@cosmjs/proto-signing";
import Long from "long";
import { DbTransaction } from "../types";
import {
  MsgType,
  TxMsg,
  TxMsgClaimRewards,
  TxMsgCreateVestingAccount,
  TxMsgDelegate,
  TxMsgRedelegate,
  TxMsgSend,
  TxMsgSetWithdrawAddress,
  TxMsgTransfer,
  TxMsgUndelegate,
} from "../types/txMsg";

const isTxMsgSend = (msg: TxMsg | EncodeObject): msg is TxMsgSend =>
  msg.typeUrl === "/cosmos.bank.v1beta1.MsgSend" &&
  "value" in msg &&
  "fromAddress" in msg.value &&
  "toAddress" in msg.value &&
  "amount" in msg.value &&
  !!msg.value.fromAddress &&
  !!msg.value.toAddress &&
  !!msg.value.amount.length;

const isTxMsgDelegate = (msg: TxMsg | EncodeObject): msg is TxMsgDelegate =>
  msg.typeUrl === "/cosmos.staking.v1beta1.MsgDelegate" &&
  "value" in msg &&
  "delegatorAddress" in msg.value &&
  "validatorAddress" in msg.value &&
  "amount" in msg.value &&
  !!msg.value.delegatorAddress &&
  !!msg.value.validatorAddress &&
  !!msg.value.amount;

const isTxMsgUndelegate = (msg: TxMsg | EncodeObject): msg is TxMsgUndelegate =>
  msg.typeUrl === "/cosmos.staking.v1beta1.MsgUndelegate" &&
  "value" in msg &&
  "delegatorAddress" in msg.value &&
  "validatorAddress" in msg.value &&
  "amount" in msg.value &&
  !!msg.value.delegatorAddress &&
  !!msg.value.validatorAddress &&
  !!msg.value.amount;

const isTxMsgRedelegate = (msg: TxMsg | EncodeObject): msg is TxMsgRedelegate =>
  msg.typeUrl === "/cosmos.staking.v1beta1.MsgBeginRedelegate" &&
  "value" in msg &&
  "delegatorAddress" in msg.value &&
  "validatorSrcAddress" in msg.value &&
  "validatorDstAddress" in msg.value &&
  "amount" in msg.value &&
  !!msg.value.delegatorAddress &&
  !!msg.value.validatorSrcAddress &&
  !!msg.value.validatorDstAddress &&
  !!msg.value.amount;

const isTxMsgClaimRewards = (msg: TxMsg | EncodeObject): msg is TxMsgClaimRewards =>
  msg.typeUrl === "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward" &&
  "value" in msg &&
  "delegatorAddress" in msg.value &&
  "validatorAddress" in msg.value &&
  !!msg.value.delegatorAddress &&
  !!msg.value.validatorAddress;

const isTxMsgSetWithdrawAddress = (msg: TxMsg | EncodeObject): msg is TxMsgSetWithdrawAddress =>
  msg.typeUrl === "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress" &&
  "value" in msg &&
  "delegatorAddress" in msg.value &&
  "withdrawAddress" in msg.value &&
  !!msg.value.delegatorAddress &&
  !!msg.value.withdrawAddress;

const isTxMsgCreateVestingAccount = (msg: TxMsg | EncodeObject): msg is TxMsgCreateVestingAccount =>
  msg.typeUrl === "/cosmos.vesting.v1beta1.MsgCreateVestingAccount" &&
  "value" in msg &&
  "fromAddress" in msg.value &&
  "toAddress" in msg.value &&
  "amount" in msg.value &&
  "endTime" in msg.value &&
  "delayed" in msg.value &&
  !!msg.value.fromAddress &&
  !!msg.value.toAddress &&
  !!msg.value.amount.length &&
  !!msg.value.endTime &&
  typeof msg.value.delayed === "boolean";

const isTxMsgTransfer = (msg: TxMsg | EncodeObject): msg is TxMsgTransfer =>
  msg.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer" &&
  "value" in msg &&
  "sourcePort" in msg.value &&
  "sourceChannel" in msg.value &&
  "sender" in msg.value &&
  "receiver" in msg.value &&
  !!msg.value.sourcePort &&
  !!msg.value.sourceChannel &&
  !!msg.value.sender &&
  !!msg.value.receiver;

const gasOfMsg = (msgType: MsgType): number => {
  switch (msgType) {
    case "send":
      return 100_000;
    case "delegate":
      return 100_000;
    case "undelegate":
      return 100_000;
    case "redelegate":
      return 100_000;
    case "claimRewards":
      return 100_000;
    case "setWithdrawAddress":
      return 100_000;
    case "createVestingAccount":
      return 100_000;
    case "msgTransfer":
      return 100_000;
    default:
      throw new Error("Unknown msg type");
  }
};

const gasOfTx = (msgTypes: readonly MsgType[]): number => {
  const txFlatGas = 100_000;
  const totalTxGas = msgTypes.reduce((acc, msgType) => acc + gasOfMsg(msgType), txFlatGas);
  return totalTxGas;
};

const importMsgCreateVestingAccount = (msg: EncodeObject): EncodeObject => {
  if (isTxMsgCreateVestingAccount(msg)) {
    return { ...msg, value: { ...msg.value, endTime: Long.fromValue(msg.value.endTime) } };
  }

  return msg;
};

const importMsgTypes = (msgs: readonly EncodeObject[]): EncodeObject[] =>
  msgs.map(importMsgCreateVestingAccount);

const dbTxFromJson = (txJson: string): DbTransaction | null => {
  try {
    const dbTx: DbTransaction = JSON.parse(txJson);
    dbTx.msgs = importMsgTypes(dbTx.msgs);

    return dbTx;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Error when parsing tx JSON from DB");
    }

    return null;
  }
};

export {
  isTxMsgSend,
  isTxMsgDelegate,
  isTxMsgUndelegate,
  isTxMsgRedelegate,
  isTxMsgClaimRewards,
  isTxMsgSetWithdrawAddress,
  isTxMsgCreateVestingAccount,
  isTxMsgTransfer,
  gasOfMsg,
  gasOfTx,
  dbTxFromJson,
};
