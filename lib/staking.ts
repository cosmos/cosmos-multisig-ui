import { QueryClient, StakingExtension, setupStakingExtension } from "@cosmjs/stargate";
import { connectComet } from "@cosmjs/tendermint-rpc";
import { Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";

const getValidatorsPage = (
  queryClient: QueryClient & StakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_BONDED", paginationKey);

export const getAllValidators = async (rpcUrl: string): Promise<readonly Validator[]> => {
  const validators: Validator[] = [];

  console.log({ rpcUrl });
  const cometClient = await connectComet(rpcUrl);
  console.log({ cometClient });
  const queryClient = QueryClient.withExtensions(cometClient, setupStakingExtension);
  console.log({ queryClient });

  let paginationKey: Uint8Array | undefined = undefined;

  do {
    const response = await getValidatorsPage(queryClient, paginationKey);
    console.log({ response });
    validators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  console.log({ validators });
  return validators;
};
