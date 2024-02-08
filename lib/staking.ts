import { QueryClient, StakingExtension, setupStakingExtension } from "@cosmjs/stargate";
import { connectComet } from "@cosmjs/tendermint-rpc";
import { Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";

const getValidatorsPage = (
  queryClient: QueryClient & StakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_BONDED", paginationKey);

export const getAllValidators = async (rpcUrl: string): Promise<readonly Validator[]> => {
  const validators: Validator[] = [];

  const cometClient = await connectComet(rpcUrl);
  const queryClient = QueryClient.withExtensions(cometClient, setupStakingExtension);

  let paginationKey: Uint8Array | undefined = undefined;

  do {
    const response = await getValidatorsPage(queryClient, paginationKey);
    validators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  return validators;
};
