import React from "react";
import { AppWrapper } from "../context/AppContext";
import ChainSelect from "../components/chainSelect/ChainSelect";

function MultisigApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <ChainSelect />
      <Component {...pageProps} />
    </AppWrapper>
  );
}
export default MultisigApp;
