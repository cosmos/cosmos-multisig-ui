import * as lavajs from "@lavanet/lavajs";

export type MsgDualDelegateEncodeObject = ReturnType<
  typeof lavajs.lavanet.lava.dualstaking.MessageComposer.withTypeUrl.delegate
>;
export const MsgDualDelegate = lavajs.lavanet.lava.dualstaking.MsgDelegate;
export type MsgDualDelegate = MsgDualDelegateEncodeObject["value"];

export type MsgDualRedelegateEncodeObject = ReturnType<
  typeof lavajs.lavanet.lava.dualstaking.MessageComposer.withTypeUrl.redelegate
>;
export const MsgDualRedelegate = lavajs.lavanet.lava.dualstaking.MsgRedelegate;
export type MsgDualRedelegate = MsgDualRedelegateEncodeObject["value"];

export type MsgDualUnbondEncodeObject = ReturnType<
  typeof lavajs.lavanet.lava.dualstaking.MessageComposer.withTypeUrl.unbond
>;
export const MsgDualUnbond = lavajs.lavanet.lava.dualstaking.MsgUnbond;
export type MsgDualUnbond = MsgDualUnbondEncodeObject["value"];

export type MsgDualClaimRewardsEncodeObject = ReturnType<
  typeof lavajs.lavanet.lava.dualstaking.MessageComposer.withTypeUrl.claimRewards
>;
export const MsgDualClaimRewards = lavajs.lavanet.lava.dualstaking.MsgClaimRewards;
export type MsgDualClaimRewards = MsgDualClaimRewardsEncodeObject["value"];
