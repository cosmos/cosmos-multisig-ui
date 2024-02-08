import { RegistryAsset } from "../types/chainRegistry";
import { displayCoinToBaseCoin } from "./coinHelpers";

const assets: readonly RegistryAsset[] = [
  {
    denom_units: [
      {
        denom: "ujunox",
        exponent: 0,
      },
      {
        denom: "junox",
        exponent: 6,
      },
    ],
    symbol: "JUNOX",
    display: "junox",
    name: "Juno Testnet",
    base: "ujunox",
  },
  {
    denom_units: [
      {
        denom: "ncheq",
        exponent: 0,
      },
      {
        denom: "cheq",
        exponent: 9,
      },
    ],
    symbol: "CHEQ",
    display: "cheq",
    name: "cheqd",
    base: "ncheq",
  },
  {
    denom_units: [
      {
        denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
        exponent: 0,
      },
      {
        denom: "arusd",
        exponent: 18,
      },
    ],
    symbol: "arUSD",
    display: "arusd",
    name: "Arable USD",
    base: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
  },
  {
    denom_units: [
      {
        denom: "wei",
        exponent: 0,
      },
      {
        denom: "gwei",
        exponent: 9,
      },
      {
        denom: "eth",
        exponent: 18,
        aliases: ["ether"],
      },
    ],
    symbol: "ETH",
    display: "eth",
    name: "Ether",
    base: "wei",
  },
];

describe("macroCoinToMicroCoin", () => {
  it("works with symbol", () => {
    expect(displayCoinToBaseCoin({ denom: "JUNOX", amount: "12" }, assets)).toEqual({
      denom: "ujunox",
      amount: "12000000",
    });
    expect(displayCoinToBaseCoin({ denom: "CHEQ", amount: "34" }, assets)).toEqual({
      denom: "ncheq",
      amount: "34000000000",
    });
    expect(displayCoinToBaseCoin({ denom: "arUSD", amount: "56" }, assets)).toEqual({
      denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
      amount: "56000000000000000000",
    });
    expect(displayCoinToBaseCoin({ denom: "ETH", amount: "78" }, assets)).toEqual({
      denom: "wei",
      amount: "78000000000000000000",
    });
  });

  it("works with base unit", () => {
    expect(displayCoinToBaseCoin({ denom: "ujunox", amount: "12" }, assets)).toEqual({
      denom: "ujunox",
      amount: "12",
    });
    expect(displayCoinToBaseCoin({ denom: "ncheq", amount: "34" }, assets)).toEqual({
      denom: "ncheq",
      amount: "34",
    });
    expect(
      displayCoinToBaseCoin(
        { denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c", amount: "56" },
        assets,
      ),
    ).toEqual({ denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c", amount: "56" });
    expect(displayCoinToBaseCoin({ denom: "wei", amount: "78" }, assets)).toEqual({
      denom: "wei",
      amount: "78",
    });
  });

  it("works with biggest unit", () => {
    expect(displayCoinToBaseCoin({ denom: "junox", amount: "12" }, assets)).toEqual({
      denom: "ujunox",
      amount: "12000000",
    });
    expect(displayCoinToBaseCoin({ denom: "cheq", amount: "34" }, assets)).toEqual({
      denom: "ncheq",
      amount: "34000000000",
    });
    expect(displayCoinToBaseCoin({ denom: "arusd", amount: "56" }, assets)).toEqual({
      denom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
      amount: "56000000000000000000",
    });
    expect(displayCoinToBaseCoin({ denom: "eth", amount: "78" }, assets)).toEqual({
      denom: "wei",
      amount: "78000000000000000000",
    });
  });

  it("works with intermediate unit", () => {
    expect(displayCoinToBaseCoin({ denom: "gwei", amount: "78" }, assets)).toEqual({
      denom: "wei",
      amount: "78000000000",
    });
    expect(displayCoinToBaseCoin({ denom: "GWEI", amount: "78" }, assets)).toEqual({
      denom: "wei",
      amount: "78000000000",
    });
  });
});
