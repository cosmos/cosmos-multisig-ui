import { EncodeObject } from "@cosmjs/proto-signing";
import { DbTransaction } from "../types";
import { MsgCodecs, MsgTypeUrl, MsgTypeUrls } from "../types/txMsg";

const gasOfMsg = (msgType: MsgTypeUrl): number => {
  switch (msgType) {
    case MsgTypeUrls.Send:
      return 100_000;
    case MsgTypeUrls.SetWithdrawAddress:
      return 100_000;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return 100_000;
    case MsgTypeUrls.BeginRedelegate:
      return 100_000;
    case MsgTypeUrls.Delegate:
      return 100_000;
    case MsgTypeUrls.Undelegate:
      return 100_000;
    case MsgTypeUrls.CreateVestingAccount:
      return 100_000;
    case MsgTypeUrls.Transfer:
      return 100_000;
    default:
      throw new Error("Unknown msg type");
  }
};

export const gasOfTx = (msgTypes: readonly MsgTypeUrl[]): number => {
  const txFlatGas = 100_000;
  const totalTxGas = msgTypes.reduce((acc, msgType) => acc + gasOfMsg(msgType), txFlatGas);
  return totalTxGas;
};

export const isKnownMsgTypeUrl = (typeUrl: string): typeUrl is MsgTypeUrl =>
  Object.values(MsgTypeUrls).includes(typeUrl as MsgTypeUrl);

export const exportMsgToJson = (msg: EncodeObject): EncodeObject => {
  if (isKnownMsgTypeUrl(msg.typeUrl)) {
    return { ...msg, value: MsgCodecs[msg.typeUrl].toJSON(msg.value) };
  }

  return msg;
};

const importMsgFromJson = (msg: EncodeObject): EncodeObject => {
  if (isKnownMsgTypeUrl(msg.typeUrl)) {
    const parsedValue = MsgCodecs[msg.typeUrl].fromJSON(msg.value);
    return { ...msg, value: parsedValue };
  }

  return msg;
};

export const dbTxFromJson = (txJson: string): DbTransaction | null => {
  try {
    const dbTx: DbTransaction = JSON.parse(txJson);
    dbTx.msgs = dbTx.msgs.map(importMsgFromJson);

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
