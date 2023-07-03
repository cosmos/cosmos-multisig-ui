import { ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { setChain, setChains, setChainsError } from "./helpers";
import { getChain, getChainFromRegistry, getChainItemsFromRegistry } from "./service";
import { storeChain } from "./storage";
import { Action, ChainsContextType, State } from "./types";

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

const chainsReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "setChains": {
      return { ...state, chains: action.payload };
    }
    case "setChain": {
      storeChain(action.payload);
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
      if (!state.chain.chainId && state.chains.mainnets.length && state.chains.testnets.length) {
        const chainName =
          state.chain.registryName ||
          location.pathname.split("/")[1] ||
          process.env.NEXT_PUBLIC_REGISTRY_NAME ||
          "cosmoshub";

        const isTestnet = !!state.chains.testnets.find(({ name }) => name === chainName);

        try {
          const chainFromRegistry = await getChainFromRegistry(chainName, isTestnet);
          setChain(dispatch, chainFromRegistry);
        } catch (error) {
          if (error instanceof Error) {
            setChainsError(dispatch, error.message);
          } else {
            setChainsError(dispatch, "Failed to get chains from registry");
          }
        }
      }
    })();
  }, [
    state.chain.chainId,
    state.chain.registryName,
    state.chains.mainnets.length,
    state.chains.testnets,
  ]);

  return <ChainsContext.Provider value={{ state, dispatch }}>{children}</ChainsContext.Provider>;
};

export const useChains = () => {
  const context = useContext(ChainsContext);
  if (context === undefined) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return { ...context.state, chainsDispatch: context.dispatch };
};
