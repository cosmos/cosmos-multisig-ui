import * as CosmjsTypesAuthz from "cosmjs-types/cosmos/authz/v1beta1/tx";
import * as CosmjsTypesBank from "cosmjs-types/cosmos/bank/v1beta1/tx";
import * as CosmjsTypesDistribution from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import * as CosmjsTypesFeegrant from "cosmjs-types/cosmos/feegrant/v1beta1/tx";
import * as CosmjsTypesGov from "cosmjs-types/cosmos/gov/v1beta1/tx";
import * as CosmjsTypesStaking from "cosmjs-types/cosmos/staking/v1beta1/tx";
import * as CosmjsTypesVesting from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import * as CosmjsTypesCosmWasm from "cosmjs-types/cosmwasm/wasm/v1/tx";
import * as CosmjsTypesIbcTransfer from "cosmjs-types/ibc/applications/transfer/v1/tx";

export const txCosmJsTypes = Object.values({
  ...CosmjsTypesAuthz,
  ...CosmjsTypesBank,
  ...CosmjsTypesDistribution,
  ...CosmjsTypesFeegrant,
  ...CosmjsTypesGov,
  ...CosmjsTypesStaking,
  ...CosmjsTypesVesting,
  ...CosmjsTypesIbcTransfer,
  ...CosmjsTypesCosmWasm,
});
