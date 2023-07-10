import { ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { isChainInfoFilled, setChain, setChains, setChainsError } from "./helpers";
import { getChain, getChainFromRegistry, getChainItemsFromRegistry } from "./service";
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

  useEffect(() => {
    (async function getChainsFromGithubRegistry() {
      try {
        const newChainItems = await getChainItemsFromRegistry();
        setChains(dispatch, newChainItems);
      } catch (error) {
        if (error instanceof Error) {
          setChainsError(dispatch, error.message);
        } else {
          setChainsError(dispatch, "Failed to get chains from registry");
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async function getChainFromRegistryIfEmpty() {
      if (
        isChainInfoFilled(state.chain) ||
        !state.chains.mainnets.length ||
        !state.chains.testnets.length
      ) {
        return;
      }

      const isTestnet = !!state.chains.testnets.find(
        ({ name }) => name === state.chain.registryName,
      );

      try {
        const chainFromRegistry = await getChainFromRegistry(state.chain.registryName, isTestnet);
        setChain(dispatch, chainFromRegistry);
      } catch (error) {
        if (error instanceof Error) {
          setChainsError(dispatch, error.message);
        } else {
          setChainsError(dispatch, `Failed to get chain ${state.chain.registryName} from registry`);
        }
      }
    })();
  }, [state.chain, state.chains.mainnets.length, state.chains.testnets]);

  return <ChainsContext.Provider value={{ state, dispatch }}>{children}</ChainsContext.Provider>;
};

export const useChains = () => {
  const context = useContext(ChainsContext);
  if (context === undefined) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return { ...context.state, chainsDispatch: context.dispatch };
};
