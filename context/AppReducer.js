export const initialState = {
  chain: {
    nodeAddress: process.env.NEXT_PUBLIC_NODE_ADDRESS,
    denom: process.env.NEXT_PUBLIC_DENOM,
    displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM,
    displayDenomExponent: parseInt(process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT, 10),
    gasPrice: process.env.NEXT_PUBLIC_GAS_PRICE,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    addressPrefix: process.env.NEXT_PUBLIC_ADDRESS_PREFIX,
  },
};

export const AppReducer = (state, action) => {
  switch (action.type) {
    case "init_stored": {
      return action.value;
    }

    case "changeChain": {
      return {
        ...state,
        chain: action.value,
      };
    }
  }
};
