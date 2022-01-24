export const initialState = {
  chain: {
    nodeAddress: process.env.NEXT_PUBLIC_NODE_ADDRESS,
    denom: process.env.NEXT_PUBLIC_DENOM,
    displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM,
    displayDenomExponent: parseInt(process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT, 10),
    gasPrice: process.env.NEXT_PUBLIC_GAS_PRICE,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    chainDisplayName: process.env.NEXT_PUBLIC_CHAIN_DISPLAY_NAME,
    addressPrefix: process.env.NEXT_PUBLIC_ADDRESS_PREFIX,
    explorerLink: process.env.NEXT_PUBLIC_EXPLORER_LINK_TX,
  },
};

export const AppReducer = (state, action) => {
  switch (action.type) {
    case "changeChain": {
      return {
        ...state,
        chain: action.value,
      };
    }
  }
};
