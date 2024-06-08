import { VoteOption, voteOptionToJSON } from "cosmjs-types/cosmos/gov/v1beta1/gov";

const voteOptionPrefix = "VOTE_OPTION_";

export const voteOptions = Object.keys(VoteOption).filter(
  (key) => isNaN(Number(key)) && key.startsWith(voteOptionPrefix),
);

export const printVoteOption = (voteOption: VoteOption): string => {
  const voteStr = voteOptionToJSON(voteOption);

  if (!voteStr.startsWith(voteOptionPrefix)) {
    return "Unrecognized";
  }

  const voteNoPrefix = voteStr.split(voteOptionPrefix)[1];

  return voteNoPrefix.charAt(0) + voteNoPrefix.slice(1).toLowerCase().replace(/_/g, " ");
};
