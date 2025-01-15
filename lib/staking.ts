import { QueryClient, StakingExtension, setupStakingExtension } from "@cosmjs/stargate";
import { connectComet } from "@cosmjs/tendermint-rpc";
import { Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";

const getBondedValidatorsPage = (
  queryClient: QueryClient & StakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_BONDED", paginationKey);

const getUnbondingValidatorsPage = (
  queryClient: QueryClient & StakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_UNBONDING", paginationKey);

const getUnbondedValidatorsPage = (
  queryClient: QueryClient & StakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_UNBONDED", paginationKey);

export interface AllValidators {
  bonded: readonly Validator[];
  unbonding: readonly Validator[];
  unbonded: readonly Validator[];
}

export function emptyAllValidatorsEmpty(): AllValidators {
  return { bonded: [], unbonding: [], unbonded: [] };
}

export const getAllValidators = async (rpcUrl: string): Promise<AllValidators> => {
  const bondedValidators: Validator[] = [];
  const unbondingValidators: Validator[] = [];
  const unbondedValidators: Validator[] = [];

  const cometClient = await connectComet(rpcUrl);
  const queryClient = QueryClient.withExtensions(cometClient, setupStakingExtension);

  let paginationKey: Uint8Array | undefined;

  // Bonded
  paginationKey = undefined;
  do {
    const response = await getBondedValidatorsPage(queryClient, paginationKey);
    bondedValidators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  // Unbonding
  paginationKey = undefined;
  do {
    const response = await getUnbondingValidatorsPage(queryClient, paginationKey);
    unbondingValidators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  // Unbonded
  paginationKey = undefined;
  do {
    const response = await getUnbondedValidatorsPage(queryClient, paginationKey);
    unbondedValidators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  return {
    bonded: bondedValidators,
    unbonding: unbondingValidators,
    unbonded: unbondedValidators,
  };
};
