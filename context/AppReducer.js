// NEXT_PUBLIC_NODE_ADDRESS=https://cosmoshub.validator.network:443
// NEXT_PUBLIC_DENOM=uatom
// NEXT_PUBLIC_DISPLAY_DENOM=ATOM
// NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT=6
// NEXT_PUBLIC_GAS_PRICE=0.03uatom
// NEXT_PUBLIC_CHAIN_ID=cosmoshub-4
// NEXT_PUBLIC_ADDRESS_PREFIX=cosmos

export const initialAppState = {
  chain: {
    nodeAddress: process.env.NEXT_PUBLIC_NODE_ADDRESS,
    denom: process.env.NEXT_PUBLIC_DENOM,
    displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM,
    displayDenomExponent: process.env.NEXT_PUBLIC_DISPLAY_DENOM_EXPONENT,
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
