/**
 * @jest-environment node
 * See https://stackoverflow.com/a/72369912
 */
import { Coin } from "@cosmjs/stargate";
import { ChainInfo } from "../context/ChainsContext/types";
import { printableCoin, printableCoins, thinSpace, trimStringsObj } from "./displayHelpers";

const testChainInfo: ChainInfo = {
  registryName: "junotestnet",
  addressPrefix: "juno",
  chainId: "uni-6",
  chainDisplayName: "Juno Testnet",
  logo: "https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/junotestnet/images/juno.svg",
  nodeAddress: "https://rpc.uni.junonetwork.io",
  nodeAddresses: ["https://rpc.uni.junonetwork.io"],
  explorerLinks: {
    tx: "https://testnet.ezstaking.tools/juno-testnet/txs/${txHash}",
    account: "https://testnet.app.ezstaking.io/juno-testnet/account/${accountAddress}",
  },
  denom: "ujunox",
  displayDenom: "JUNOX",
  displayDenomExponent: 6,
  assets: [
    {
      description: "The native token of JUNO Chain",
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
      base: "ujunox",
      name: "Juno Testnet",
      display: "junox",
      symbol: "JUNOX",
      logo_URIs: {
        png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/junotestnet/images/juno.png",
        svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/junotestnet/images/juno.svg",
      },
      coingecko_id: "juno-network",
    },
  ],
  gasPrice: "0.04ujunox",
};

const emptyCoin: Coin = { amount: "", denom: "" };
const coinInChain: Coin = { amount: "1000", denom: "ujunox" };
const coinNotInChainLeading: Coin = { amount: "20000", denom: "utest" };
const coinNotInChainNotLeading: Coin = { amount: "300000", denom: "TEST" };
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
    expect(printableCoin(coinNotInChainLeading, testChainInfo)).toEqual(`20000${thinSpace}UTEST`);
  });

  it("works with coin not in ChainInfo without leading 'u'", () => {
    expect(printableCoin(coinNotInChainNotLeading, testChainInfo)).toEqual(
      `300000${thinSpace}TEST`,
    );
  });

  it("works with IBC coin", () => {
    expect(printableCoin(ibcCoin, testChainInfo)).toEqual(`4000000${thinSpace}ibc/C4CFF…319F9`);
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
      `0.001${thinSpace}JUNOX, 20000${thinSpace}UTEST, 300000${thinSpace}TEST, 4000000 ibc/C4CFF…319F9`,
    );
  });
});

describe("trimStringsObj", () => {
  it("works as intended", () => {
    const state = { foo: "  bar  ", baz: "  quux  " };
    const trimmedState = trimStringsObj(state);

    expect(trimmedState).toEqual({ foo: "bar", baz: "quux" });
    expect(state).toEqual({ foo: "  bar  ", baz: "  quux  " }); // original object is not modified
  });
});
