import { Decimal } from "@cosmjs/math";
import { Coin } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { RegistryAsset } from "../types/chainRegistry";

const macroCoinToMicroCoin = (macroCoin: Coin, assets: readonly RegistryAsset[]): Coin => {
  const lowerCaseDenom = macroCoin.denom.toLowerCase();

  const asset = assets.find(
    (currentAsset) =>
      lowerCaseDenom === currentAsset.symbol.toLowerCase() ||
      lowerCaseDenom === currentAsset.display.toLowerCase() ||
      lowerCaseDenom === currentAsset.name.toLowerCase() ||
      lowerCaseDenom === currentAsset.base.toLowerCase() ||
      currentAsset.denom_units.find(
        (unit) => unit.denom === lowerCaseDenom || unit.aliases?.includes(lowerCaseDenom),
      ),
  );

  assert(asset, `An asset with the given symbol ${macroCoin.denom} was not found`);

  const macroUnit = asset.denom_units.find(
    (currentUnit) => lowerCaseDenom === currentUnit.denom.toLowerCase(),
  );
  assert(macroUnit, `A unit with the given symbol ${lowerCaseDenom} was not found`);

  const baseUnit = asset.denom_units.find((currentUnit) => currentUnit.exponent === 0);
  assert(baseUnit, `A base unit with exponent = 0 was not found`);

  const denom = baseUnit.denom;
  const amount = Decimal.fromUserInput(macroCoin.amount.trim() || "0", macroUnit.exponent).atomics;

  return { denom, amount };
};

export { macroCoinToMicroCoin };
