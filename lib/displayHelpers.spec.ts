import { Coin } from "@cosmjs/stargate";
import { ChainInfo } from "../types";
import { printableCoin, printableCoins, thinSpace } from "./displayHelpers";

const testChainInfo: ChainInfo = {
  registryName: "junotestnet",
  addressPrefix: "juno",
  chainId: "uni-6",
  chainDisplayName: "Juno Testnet",
  nodeAddress: "https://rpc.uni.junonetwork.io",
  explorerLink: "https://testnet.ezstaking.tools/juno-testnet/txs/${txHash}",
  denom: "ujunox",
  displayDenom: "JUNOX",
  displayDenomExponent: 6,
  gasPrice: "0.04ujunox",
};

const emptyCoin: Coin = { amount: "", denom: "" };
const coinInChain: Coin = { amount: "1000", denom: "ujunox" };
const coinNotInChainLeading: Coin = { amount: "20000", denom: "utest" };
const coinNotInChainNotLeading: Coin = { amount: "300000", denom: "test" };
const ibcCoin: Coin = {
  amount: "4000000",
  denom: "ibc/c4cff46fd6de35ca4cf4ce031e643c8fdc9ba4b99ae598e9b0ed98fe3a2319f9",
};

describe("printableCoin", () => {
  it("works with empty coin", () => {
    expect(printableCoin(emptyCoin, testChainInfo)).toEqual("");
  });

  it("works with coin in ChainInfo", () => {
    expect(printableCoin(coinInChain, testChainInfo)).toEqual(`0.001${thinSpace}JUNOX`);
  });

  it("works with coin not in ChainInfo with leading 'u'", () => {
    expect(printableCoin(coinNotInChainLeading, testChainInfo)).toEqual(`0.02${thinSpace}TEST`);
  });

  it("works with coin not in ChainInfo without leading 'u'", () => {
    expect(printableCoin(coinNotInChainNotLeading, testChainInfo)).toEqual(
      `300000${thinSpace}test`,
    );
  });

  it("works with IBC coin", () => {
    expect(printableCoin(ibcCoin, testChainInfo)).toEqual(`4000000${thinSpace}ibc/c4cff…319f9`);
  });
});

describe("printableCoins", () => {
  it("works with empty coins", () => {
    expect(printableCoins([], testChainInfo)).toEqual("");
  });

  it("works with one coin", () => {
    expect(printableCoins([coinInChain], testChainInfo)).toEqual(`0.001${thinSpace}JUNOX`);
  });

  it("works with coins of many types", () => {
    const coins: readonly Coin[] = [
      emptyCoin,
      coinInChain,
      coinNotInChainLeading,
      coinNotInChainNotLeading,
      ibcCoin,
    ];

    expect(printableCoins(coins, testChainInfo)).toEqual(
      `0.001${thinSpace}JUNOX, 0.02${thinSpace}TEST, 300000${thinSpace}test, 4000000 ibc/c4cff…319f9`,
    );
  });
});
