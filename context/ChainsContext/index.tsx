import { getAllValidators } from "@/lib/staking";
import { ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { emptyChain, isChainInfoFilled, setChain, setChains, setChainsError } from "./helpers";
import { getChain, getNodeFromArray, useChainsFromRegistry } from "./service";
import { addLocalChainInStorage, addRecentChainNameInStorage, setChainInUrl } from "./storage";
import { Action, ChainsContextType, State } from "./types";

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

const chainsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setChains": {
      return { ...state, chains: action.payload };
    }
    case "setChain": {
      if (!isChainInfoFilled(action.payload)) {
        return state;
      }

      if (
        !state.chains.mainnets.has(action.payload.registryName) &&
        !state.chains.testnets.has(action.payload.registryName)
      ) {
        addLocalChainInStorage(action.payload, state.chains);
      }

      addRecentChainNameInStorage(action.payload.registryName);
      setChainInUrl(action.payload, state.chains);

      return {
        ...state,
        chain: action.payload,
        validatorState: { validators: [], status: "initial" },
      };
    }
    case "addNodeAddress": {
      return { ...state, chain: { ...state.chain, nodeAddress: action.payload } };
    }
    case "loadValidators": {
      return state.validatorState.status === "initial"
        ? { ...state, validatorState: { ...state.validatorState, status: "loading" } }
        : state;
    }
    case "setValidatorState": {
      return { ...state, validatorState: action.payload };
    }
    case "setNewConnection": {
      return { ...state, newConnection: action.payload };
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
    chain: emptyChain,
    chains: { mainnets: new Map(), testnets: new Map(), localnets: new Map() },
    newConnection: { action: "edit" },
    validatorState: { validators: [], status: "initial" },
  });

  const { chainItems, chainItemsError } = useChainsFromRegistry();

  useEffect(() => {
    setChains(dispatch, chainItems);
    setChainsError(dispatch, chainItemsError);

    const loadedChain = getChain(chainItems);

    if (chainItems.mainnets.size && loadedChain === emptyChain) {
      setChain(dispatch, chainItems.mainnets.get("cosmoshub") ?? emptyChain);
    } else {
      setChain(dispatch, loadedChain);
    }
  }, [chainItems, chainItemsError]);

  useEffect(() => {
    (async function addNodeAddress() {
      if (isChainInfoFilled(state.chain) && !state.chain.nodeAddress) {
        const nodeAddress = await getNodeFromArray(state.chain.nodeAddresses);
        dispatch({ type: "addNodeAddress", payload: nodeAddress });
      }
    })();
  }, [state.chain]);

  useEffect(() => {
    (async function loadValidators() {
      if (state.validatorState.status === "loading" && state.chain.nodeAddress) {
        try {
          const validators = await getAllValidators(state.chain.nodeAddress);
          dispatch({ type: "setValidatorState", payload: { validators, status: "done" } });
        } catch (e) {
          console.error(e instanceof Error ? e.message : "Failed to load validators");
          dispatch({ type: "setValidatorState", payload: { validators: [], status: "error" } });
        }
      }
    })();
  }, [state.chain.nodeAddress, state.validatorState.status]);

  return <ChainsContext.Provider value={{ state, dispatch }}>{children}</ChainsContext.Provider>;
};

export const useChains = () => {
  const context = useContext(ChainsContext);
  if (context === undefined) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return { ...context.state, chainsDispatch: context.dispatch };
};
