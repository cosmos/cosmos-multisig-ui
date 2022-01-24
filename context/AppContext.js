import React, { useEffect, createContext, useContext, useReducer } from "react";

import { AppReducer, initialState } from "./AppReducer";

const AppContext = createContext();
export function AppWrapper({ children }) {
  let existingState;
  if (typeof window !== "undefined") {
    existingState = JSON.parse(localStorage.getItem("state"));
  }
  const [state, dispatch] = useReducer(AppReducer, existingState ? existingState : initialState);

  const contextValue = { state, dispatch };

  useEffect(() => {
    // create and/or set a new localstorage variable called "state"
    if (state && state !== initialState) {
      localStorage.setItem("state", JSON.stringify(state));
    }
  }, [state]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  return useContext(AppContext);
}
