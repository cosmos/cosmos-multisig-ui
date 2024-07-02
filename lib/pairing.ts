import * as lavajs from "@lavanet/lavajs";
import { StakeEntry } from "@lavanet/lavajs/dist/codegen/lavanet/lava/epochstorage/stake_entry";

export const getProviders = async (
  rpcEndpoint: string,
  chainID: string,
): Promise<readonly StakeEntry[]> => {
  const queryClient = await lavajs.lavanet.ClientFactory.createRPCQueryClient({ rpcEndpoint });

  const { stakeEntry } = await queryClient.lavanet.lava.pairing.providers({
    chainID,
    showFrozen: true,
  });

  return stakeEntry.sort((a, b) => a.moniker.localeCompare(b.moniker));
};
