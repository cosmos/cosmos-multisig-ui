import { ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { setChain, setChains, setChainsError } from "./helpers";
import { getChain, useChainFromRegistry, useChainsFromRegistry } from "./service";
import { setChainInStorage, setChainInUrl } from "./storage";
import { Action, ChainsContextType, State } from "./types";

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

const chainsReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "setChains": {
      return { ...state, chains: action.payload };
    }
    case "setChain": {
      setChainInStorage(action.payload);
      setChainInUrl(action.payload);
      return { ...state, chain: action.payload };
    }
    case "setChainsError": {
      return { ...state, chainsError: action.payload };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
};

interface ChainsProviderProps {
  readonly children: ReactNode;
}

export const ChainsProvider = ({ children }: ChainsProviderProps) => {
  const [state, dispatch] = useReducer(chainsReducer, {
    chain: getChain(),
    chains: { mainnets: [], testnets: [] },
  });

  const { chainItems, chainItemsError } = useChainsFromRegistry();
  const { chainFromRegistry, chainFromRegistryError } = useChainFromRegistry(
    state.chain,
    chainItems,
  );

  useEffect(() => {
    setChains(dispatch, chainItems);
    setChainsError(dispatch, chainItemsError);
  }, [chainItems, chainItemsError]);

  useEffect(() => {
    if (chainFromRegistry !== state.chain) {
      setChain(dispatch, chainFromRegistry);
      setChainsError(dispatch, chainFromRegistryError);
    }
  }, [chainFromRegistry, chainFromRegistryError, state.chain]);

  return <ChainsContext.Provider value={{ state, dispatch }}>{children}</ChainsContext.Provider>;
};

export const useChains = () => {
  const context = useContext(ChainsContext);
  if (context === undefined) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return { ...context.state, chainsDispatch: context.dispatch };
};
